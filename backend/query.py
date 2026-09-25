from app.factory.rag_factory import create_rag_service
from app.container import container
from app.config.settings import settings


rag_service = create_rag_service()

#main method
def main(question):

    response = rag_service.ask(
        question
    )

    print(response)

#responsive infinite loop
def QnA():
    while(True):
        query = input("Ask your question...")
        if query in ["exit", "stop", "cancel", "pause", "done"]:
            break
        main(question=query)

if __name__ == "__main__":
    """
    (.venv) PS D:\Projects\python\ai-lab\interview-assist\backend> python .\query.py
    """

    #run the chat loop
    QnA()