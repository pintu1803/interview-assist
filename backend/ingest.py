from app.factory.ingest_factory import create_ingest_service
from pathlib import Path
from app.config.settings import settings

#do it only once
ingestion_service = create_ingest_service()

#define the history path
INGESTION_HISTORY = settings.ingestion_history

def main(path:str=""):

    #check for path validity
    if path == "":
        print("Empty path provided, skipping...")
        return

    try:
        print(f"Ingesting {path}")
        ingestion_service.ingest(path)

        mark_as_ingested(path)
    except Exception as e:
        print("Exception occurred - ", e)
        

#Mark the given pdf file as ingested, to avoid duplicate ingestion
def mark_as_ingested(pdf_path:str=""):
    if pdf_path == "":
        print("Empty path provided, skipping...")
        return

    #add the file name into record books
    filename = Path(pdf_path).name
    history_path = Path(INGESTION_HISTORY)
    with history_path.open("a", encoding="utf-8") as f:
        f.write(filename + "\n")

#Return the list of pdf file names 
def load_ingested_files(INGESTION_HISTORY: str):
    path = Path(INGESTION_HISTORY)

    if not path.exists():
        return set()
    else: 
        return set(path.read_text().splitlines())
    
if __name__ == "__main__":
    # main()

    #get the already ingested file names
    already_ingested = load_ingested_files(INGESTION_HISTORY)

    #read the knowledge base dir
    java_path = settings.doc_storage
    directory = Path(java_path)
    list_of_pdfs = list(directory.glob("*.pdf")) #this gives full/absolute path, not just file names

    #lets handle knowledge base pdfs one by one
    for pdf_file in list_of_pdfs:
        if pdf_file.name not in already_ingested:
            main(str(pdf_file))
        else:
            print(f"Skipping {pdf_file.name} as it is already ingested")