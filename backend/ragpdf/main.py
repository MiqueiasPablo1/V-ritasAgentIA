from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from dotenv import load_dotenv

load_dotenv()

CAMINHO_DB = "db"
 
MODELO_CHAT = "llama3.2:3b"

prompt_template = PromptTemplate.from_template("""
Responda a pergunta do usuário: 
{pergunta}

com base nessas informações: 
{base_conhecimento}

Caso não for encontrado resposta para a pergunta na base de conhecimento, retorne: 
Não sei te dizer isso""")

def perguntar():
    pergunta = input("Digite sua pergunta: ")

    funcao_embedding = HuggingFaceEmbeddings(model_name= "intfloat/multilingual-e5-small")
    db = Chroma(persist_directory=CAMINHO_DB, embedding_function= funcao_embedding)

    resultados = db.similarity_search_with_relevance_scores(pergunta, k=3)
    if len(resultados) == 0 or resultados[0][1] < 0.7:
        print("Nenhum resultado relevante encontrado")
        return

    textos_resultados = []
    for resultado in resultados:
        texto = resultado[0].page_content
        textos_resultados.append(texto)

    base_conhecimento = "\n\n------\n\n".join(textos_resultados)
    prompt = prompt_template
    prompt = prompt.invoke({"pergunta": pergunta, "base_conhecimento": base_conhecimento})
    #print(prompt)

    modelo = ChatOllama(
        model= MODELO_CHAT,  
        temperature=0.3,
        num_predict=512,        
    )
    
    texto_resposta = modelo.invoke(prompt)
    print(texto_resposta.content)

perguntar()