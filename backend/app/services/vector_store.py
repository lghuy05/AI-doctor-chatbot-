from app.services.pinecone_service import pinecone_service


def query_medical_knowledge(query: str, n_results: int):
    return pinecone_service.query_medical_knowledge(query, n_results)


def check_collection():
    # For Pinecone, we can't easily peek like ChromaDB
    print("📊 Pinecone collection - use Pinecone console to view documents")


def main():
    from app.services.pubmed_service import get_article_from_pubmed

    common_symptoms = [
        "fever",
        "headache",
        "cough",
        "chest pain",
        "abdominal pain",
        "fatigue",
        "dizziness",
        "nausea",
        "shortness of breath",
    ]

    articles = get_article_from_pubmed(common_symptoms)
    pinecone_service.store_articles(articles)
    print(f"Stored {len(articles)} articles in Pinecone")


if __name__ == "__main__":
    result = query_medical_knowledge("I feel headache and insomnia", 5)
    print(result)
