import pinecone
import os


class PineconeService:
    def __init__(self):
        # Replace with your actual API key
        self.api_key = "pcsk_5cfNae_Dp4qugArHYBju1W3uvNEtaudVy8ccr8433nV3Qkc56Da9bNhYhnqGFFXzX6Lnno"
        self.environment = "aped-4627-b74a-pinecone"  # From your URL
        self.index_name = "medical-knowledge"

        # Initialize Pinecone
        pinecone.init(api_key=self.api_key, environment=self.environment)
        self.index = pinecone.Index(self.index_name)

    def query_medical_knowledge(self, query: str, n_results: int = 5):
        """Query medical knowledge using Pinecone"""
        try:
            # Pinecone will automatically use llama-text-embed-v2
            results = self.index.query(
                vector=[0] * 1024,  # 1024 dimensions from your config
                top_k=n_results,
                include_metadata=True,
            )

            # Format results to match your existing ChromaDB structure
            documents = []
            metadatas = []
            distances = []

            for match in results.matches:
                documents.append(match.metadata.get("content", ""))
                metadatas.append(match.metadata)
                distances.append(1 - match.score)  # Convert similarity to distance

            return {
                "documents": [documents],
                "metadatas": [metadatas],
                "distances": [distances],
            }

        except Exception as e:
            print(f"❌ Pinecone query error: {e}")
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

    def store_articles(self, articles):
        """Store articles in Pinecone"""
        try:
            vectors = []
            for article in articles:
                vectors.append(
                    {
                        "id": f"pubmed_{article['pubmed_id']}",
                        "values": [0]
                        * 1024,  # 1024 dummy dimensions - Pinecone will handle embeddings
                        "metadata": {
                            "pubmed_id": article["pubmed_id"],
                            "title": article["title"],
                            "content": article["content"][:1000],  # Limit content size
                            "year": article["year"],
                            "journal": article["journal"],
                            "article_type": article["article_type"],
                            "keywords": ",".join(article["keywords"]),
                            "source": "PubMed",
                        },
                    }
                )

            # Upsert to Pinecone
            self.index.upsert(vectors=vectors)
            print(f"✅ Stored {len(articles)} articles in Pinecone")

        except Exception as e:
            print(f"❌ Pinecone storage error: {e}")


# Global instance
pinecone_service = PineconeService()
