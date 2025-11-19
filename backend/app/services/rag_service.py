from app.services.vector_store import query_medical_knowledge
from app.services.pubmed_service import get_article_from_pubmed
from app.openrouter_client import extract_medical_keywords
from app.services.pinecone_service import pinecone_service


def get_medical_context(symptoms: str, min_results: int = 2):
    print(f"🔧 Pinecone index available: {pinecone_service.index is not None}")

    # First try Pinecone
    results = query_medical_knowledge(symptoms, n_results=min_results + 1)
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]
    documents_found = len(documents)
    print(f"Found {documents_found} documents in Pinecone")

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

        return {"source": "pinecone", "articles": formatted_articles}

    # If not enough results in Pinecone, try PubMed
    try:
        symptoms = extract_medical_keywords(symptoms)
        new_articles = get_article_from_pubmed(symptoms)

        # Store new articles in Pinecone instead of ChromaDB
        success = pinecone_service.store_articles(new_articles)

        if success:
            # Query again
            results = query_medical_knowledge(symptoms, n_results=min_results + 2)
            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]
            documents_found = len(documents)
            print(
                f"Found {documents_found} documents in Pinecone after storing new articles"
            )

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

                return {"source": "pinecone", "articles": formatted_articles}
    except Exception as e:
        return {"error": str(e), "articles": []}

    return {"error": "Insufficient medical context found", "articles": []}


if __name__ == "__main__":
    # When run directly for quick local testing, run this block.
    # Prefer running as a package to keep imports predictable:
    #   python -m backend.app.services.rag_service
    context = get_medical_context("I have insomnia")
    print(context)
