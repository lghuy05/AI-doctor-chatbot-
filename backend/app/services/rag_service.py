import chromadb
from vector_store import query_medical_knowledge
from pubmed_service import get_article_from_pubmed
from app.openrouter_client import extract_medical_keywords


def get_medical_context(symptoms: str, min_results: int = 5):
    results = query_medical_knowledge(symptoms, n_results=min_results + 2)
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]
    documents_found = len(documents)
    print(f"Found {documents_found} documents in chromadb")

    if documents_found >= min_results:
        formatted_articles = []
        for i in range(min_results):
            formatted_articles.append(
                {
                    "title": metadatas[i].get("title", "No title"),
                    "content": documents[i],
                    "year": metadatas[i].get("year", "Unknown"),
                    "journal": metadatas[i].get("journal", "Unknown"),
                    "pubmed_id": metadatas[i].get("pubmed_id", "Unknown"),
                    # Convert distance to similarity
                    "relevance_score": 1 - distances[i],
                }
            )

        return {"source": "chromadb", "article": formatted_articles}
    try:
        symptoms = extract_medical_keywords(symptoms)
        new_articles = get_article_from_pubmed(symptoms)

        chroma_client = chromadb.PersistentClient("../chroma_storage/chroma_data")

        collection = chroma_client.get_or_create_collection("medical_knowledge")
        documents = []
        ids = []
        metadatas = []

        for article in new_articles:
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
        # query again
        results = query_medical_knowledge(symptoms, n_results=min_results + 2)
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]
        documents_found = len(documents)
        print(f"Found {documents_found} documents in chromadb")

        if documents_found >= min_results:
            formatted_articles = []
            for i in range(min_results):
                formatted_articles.append(
                    {
                        "title": metadatas[i].get("title", "No title"),
                        "content": documents[i],
                        "year": metadatas[i].get("year", "Unknown"),
                        "journal": metadatas[i].get("journal", "Unknown"),
                        "pubmed_id": metadatas[i].get("pubmed_id", "Unknown"),
                        # Convert distance to similarity
                        "relevance_score": 1 - distances[i],
                    }
                )

            return {"source": "chromadb", "article": formatted_articles}
    except Exception as e:
        return {"error": str(e), "article": []}
    return {"error": "Insufficient medical context found", "articles": []}


if __name__ == "__main__":
    # When run directly for quick local testing, run this block.
    # Prefer running as a package to keep imports predictable:
    #   python -m backend.app.services.rag_service
    context = get_medical_context("I have insomnia")
    print(context)
