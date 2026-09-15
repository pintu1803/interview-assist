from app.factory.ingest_factory import create_ingest_service


def main(path:str=""):

    print("Before-1")
    ingestion_service = create_ingest_service()

    print("Before calling path-2")
    ingestion_service.ingest(path)


if __name__ == "__main__":
    # main()
    main("D:/Projects/python/ai-lab/interview-assist/backend/knowledge_base/java/java1.pdf")