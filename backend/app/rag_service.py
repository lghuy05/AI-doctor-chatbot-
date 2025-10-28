from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings

# --- Configuration (Must match indexing script) ---
CHROMA_PATH = "chroma_db"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2" # Recommended for local/fast use

# Global variable to hold the initialized vector store
vector_store = None
embeddings = None

def initialize_rag_service():
    """Initializes the embedding model and loads the ChromaDB index."""
    global vector_store, embeddings
    try:
        # Initialize the Sentence Transformer embedding model
        embeddings = SentenceTransformerEmbeddings(model_name=EMBEDDING_MODEL_NAME)
        
        # Load the persisted Chroma store from the disk
        vector_store = Chroma(
            persist_directory=CHROMA_PATH,
            embedding_function=embeddings
        )
        print("✅ RAG Service: ChromaDB and Embeddings loaded successfully.")
        return True
    except Exception as e:
        print(f"❌ RAG Service Error: Could not load vector store. Did you run index_data.py? Error: {e}")
        vector_store = None
        return False

def retrieve_context(query: str, k: int = 5) -> tuple[str, list[str]]:
    """
    Performs semantic search to find relevant context for a user query.
    
    Returns: A tuple (context_text, source_list)
    """
    if not vector_store:
        return "", []

    # Perform similarity search using the user's query vector
    relevant_docs = vector_store.similarity_search(query, k=k)
    
    # Concatenate the content of the retrieved documents for the LLM prompt
    context_text = "\n---\n".join([doc.page_content for doc in relevant_docs])
    
    # Extract sources for citation/verification
    source_list = [
        doc.metadata.get('source', 'Unknown Source')
        for doc in relevant_docs
    ]

    # Return the raw text context and the list of unique sources
    return context_text, list(set(source_list))

# Run initialization when module is imported
initialize_rag_service()