import chromadb
import uuid

from numpy import testing

chroma_client = chromadb.Client()

collection1 = chroma_client.get_or_create_collection("testing")
collection2 = chroma_client.get_or_create_collection("medical_knowledge")

with open

collection1.add(
    ids=[str(uuid.uuid4()) for _ in testing]
    documents=)
