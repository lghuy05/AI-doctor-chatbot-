import os
import re
import requests
import time
from bs4 import BeautifulSoup, Tag
from typing import List, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader, PyPDFLoader # Import loaders
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings

# --- Configuration (Match rag_service.py) ---
CHROMA_PATH = "chroma_db"
DATA_PATH = "knowledge_base/data"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2" 

def load_documents():
    """Load all documents from the data directory."""
    documents = []
    print(f"Loading documents from: {DATA_PATH}")

    for filename in os.listdir(DATA_PATH):
        filepath = os.path.join(DATA_PATH, filename)
        
        # Skip directories
        if os.path.isdir(filepath):
            continue
            
        loader = None
        
        # Logic for handling different file types:
        if filename.endswith(".txt"):
            loader = TextLoader(filepath)
        elif filename.endswith(".pdf"):
            loader = PyPDFLoader(filepath)
            
        if loader:
            try:
                # Load documents
                loaded_docs = loader.load()
                
                # Optional: Add metadata to show the source file
                for doc in loaded_docs:
                    doc.metadata['source'] = filename
                    
                documents.extend(loaded_docs)
                print(f"  -> Successfully loaded: {filename}")
            except Exception as e:
                print(f"  -> Warning: Could not load {filename}. Error: {e}")
                
    return documents

def split_text(documents):
    """Splits documents into smaller, overlapping chunks."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " "]
    )
    return text_splitter.split_documents(documents)

def main():
    if not os.path.exists(DATA_PATH) or not os.listdir(DATA_PATH):
        print(f"🛑 Error: '{DATA_PATH}' folder is empty. Please run the scraper first and ensure documents are available.")
        return

    print("Step 1: Loading and splitting documents...")
    documents = load_documents()
    chunks = split_text(documents)
    print(f"Loaded {len(documents)} documents, created {len(chunks)} chunks.")

    print("Step 2: Creating embeddings and storing in ChromaDB...")
    
    # Initialize embedding model
    # Note: SentenceTransformer is automatically downloaded on first run.
    embeddings = SentenceTransformerEmbeddings(model_name=EMBEDDING_MODEL_NAME)

    # Create and persist the vector store (this takes time)
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH
    )

    vector_store.persist()
    print(f"🎉 Success! Medical knowledge indexed and stored in '{CHROMA_PATH}'.")

if __name__ == "__main__":
    main()
