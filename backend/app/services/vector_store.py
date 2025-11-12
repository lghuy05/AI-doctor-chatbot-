from app.services.pinecone_service import pinecone_service


def query_medical_knowledge(query: str, n_results: int):
    return pinecone_service.query_medical_knowledge(query, n_results)


def check_collection():
    if pinecone_service.index:
        stats = pinecone_service.index.describe_index_stats()
        print(f"📊 Pinecone index stats: {stats}")
    else:
        print("❌ Pinecone index not available")


if __name__ == "__main__":
    # Test the integrated embeddings
    result = query_medical_knowledge("I feel headache and insomnia", 5)
    print("Test results:", result)
