from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

PASTA_BASE = "backend/ragpdf/base"

def criar_db():
    documentos = carregar_documentos()
    chunks = dividir_chunks(documentos)
    vetorizar_chunks(chunks)

def carregar_documentos():
    carregador = PyPDFDirectoryLoader(PASTA_BASE, glob="*.pdf")
    documentos = carregador.load()
    return documentos

def dividir_chunks(documentos):
    separador_documentos = RecursiveCharacterTextSplitter(
        chunk_size=3000,
        chunk_overlap =800,
        length_function=len,
        add_start_index=True
    )
    chunks = separador_documentos.split_documents(documentos)
    print(len(chunks))
    return chunks

def vetorizar_chunks(chunks):
    embeddings = HuggingFaceEmbeddings(model_name= "intfloat/multilingual-e5-large")
    db = Chroma.from_documents(chunks, embeddings, persist_directory="db")
    print("Banco de dados criado")

criar_db()
    