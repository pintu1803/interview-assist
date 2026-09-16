from app.services.rag_service import RAGService
from app.factory.rag_factory import create_rag_service
from app.container import container


rag_service = create_rag_service()

def main(question):

    response = rag_service.ask(
        question
    )

    print(response)


if __name__ == "__main__":

    main(
        "What is Sum Root to Leaf Numbers"
    )