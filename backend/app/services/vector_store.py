import chromadb
from app.services.pubmed_service import get_article_from_pubmed


def query_medical_knowledge(query: str, n_results: int):
    client = chromadb.PersistentClient("../chroma_storage/chroma_data")
    collection = client.get_collection("medical_knowledge")
    results = collection.query(query_texts=[query], n_results=n_results)

    return results


def check_collection():
    client = chromadb.PersistentClient("../chroma_storage/chroma_data")
    collection = client.get_collection("medical_knowledge")

    print(f"📊 Collection has {collection.count()} documents")

    # Sample some documents to check for duplicates
    sample = collection.peek(limit=5)
    for i, (doc, metadata) in enumerate(zip(sample["documents"], sample["metadatas"])):
        print(f"{i + 1}. ID: {sample['ids'][i]}")
        print(f"   Title: {metadata['title'][:50]}...")
        print(f"   Content: {doc[:80]}...")
        print()


def main():
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
        "back pain",
        "joint pain",
        "rash",
        "sore throat",
    ]

    articles = get_article_from_pubmed(common_symptoms)
    chroma_client = chromadb.PersistentClient("../chroma_storage/chroma_data")

    collection = chroma_client.get_or_create_collection("medical_knowledge")
    documents = []
    ids = []
    metadatas = []

    for article in articles:
        documents.append(article["content"])
        metadatas.append(
            {
                "pubmed_id": article["pubmed_id"],
                "title": article["title"],
                "year": article["year"],
                "journal": article["journal"],
                "article_type": article["article_type"],
                "keywords": ",".join(article["keywords"]),
                "source": "PubMed",
            }
        )
        ids.append(f"pubmed_{article['pubmed_id']}")
    collection.add(ids=ids, documents=documents, metadatas=metadatas)

    print(f"Stored {len(articles)} articles")
    print(collection.peek())


if __name__ == "__main__":
    result = query_medical_knowledge("I feel headache and insomnia", 5)
    print(result)
