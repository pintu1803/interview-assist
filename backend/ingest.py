from app.factory.ingest_factory import create_ingest_service
from pathlib import Path
from app.config.settings import settings

#do it only once
ingestion_service = create_ingest_service()

#define the history path
INGESTION_HISTORY = settings.ingestion_history

#create the file if absent
INGESTION_HISTORY.touch(exist_ok=True)

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
def load_ingested_files(INGESTION_HISTORY: Path):
    path = INGESTION_HISTORY

    if not path.exists():
        return set()
    else: 
        return set(path.read_text().splitlines())


def ingest_all():
    #ingest every new PDF in knowledge base dir
    directory = settings.doc_storage

    if not directory.is_dir():
        raise FileNotFoundError(f"Knowledge base dir not found: {directory.resolve()}")
    
    #get the already ingested file names
    already_ingested = load_ingested_files(INGESTION_HISTORY)
    list_of_pdfs = sorted(directory.glob("*.pdf")) #this gives full/absolute path, not just file names

    print("Size of pdf list = ", len(list_of_pdfs))
    
    failed = done = skipped = 1
    #lets handle knowledge base pdfs one by one
    for pdf_file in list_of_pdfs:
        print("pdf file path - ", pdf_file)
        if pdf_file.name not in already_ingested:
            main(str(pdf_file))
            done += 1
        elif pdf_file.name in already_ingested:
            print(f"Skipping {pdf_file.name} as it is already ingested")
            skipped += 1
        else:
            failed += 1

    return {"ingested": done, "skipped":skipped, "failed":failed}
        

if __name__ == "__main__":
    #print the dict
    print(ingest_all())

