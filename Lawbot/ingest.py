import streamlit as st
import os
import shutil
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer

# Load environment variables
load_dotenv()

# Set up directories
dataset_dir = "dataset"
vectorstore_path = "Faiss"
log_file = "dataset_log.txt"

# Helper Functions
def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=50000, chunk_overlap=1000)
    chunks = text_splitter.split_text(text)
    return chunks

def create_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    
    if os.path.exists(vectorstore_path):
        vector_store = FAISS.load_local(vectorstore_path, embeddings=embeddings, allow_dangerous_deserialization=True)
        vector_store.add_texts(text_chunks, embedding=embeddings)
    else:

        vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    
    vector_store.save_local(vectorstore_path)

def get_all_files():
    return [f for f in os.listdir(dataset_dir) if os.path.isfile(os.path.join(dataset_dir, f))]

def get_converted_files():
    if not os.path.exists(log_file):
        return []
    with open(log_file, 'r') as file:
        converted_files = file.read().splitlines()
    return converted_files

def log_converted_files(files):
    with open(log_file, 'a') as file:
        for file_name in files:
            file.write(file_name + "\n")

def add_files_to_dataset(files):
    for file in files:
        destination = os.path.join(dataset_dir, os.path.basename(file))
        if os.path.exists(destination):
            st.warning(f"File '{os.path.basename(file)}' already exists and will be skipped.")
            continue
        shutil.move(file, dataset_dir)

def get_faiss_stats():
    if not os.path.exists(vectorstore_path):
        return {"chunks": 0, "embeddings": 0, "documents": 0}
    
    # Initialize the embeddings object
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    
    # Load the FAISS vector store
    vector_store = FAISS.load_local(vectorstore_path, embeddings=embeddings, allow_dangerous_deserialization=True)
    
    # Extract statistics
    num_embeddings = vector_store.index.ntotal  # Number of embeddings (vectors) in the FAISS index
    embedding_dimension = vector_store.index.d  # Dimension of each embedding (if needed)
    
    # Mockup for document and chunk counts; replace with real logic if metadata is stored
    num_documents = len(vector_store.documents) if hasattr(vector_store, 'documents') else num_embeddings
    num_chunks = num_embeddings  # Typically, the number of chunks is equivalent to the number of embeddings
    
    return {
        "chunks": num_chunks,
        "embeddings": embedding_dimension,
        "documents": num_documents
    }

def get_faiss_embeddings():
    if not os.path.exists(vectorstore_path):
        return []
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    
    vector_store = FAISS.load_local(vectorstore_path, embeddings=embeddings, allow_dangerous_deserialization=True)
    
    vectors = vector_store.index.reconstruct_n(0, vector_store.index.ntotal)
    return vectors

def query_faiss(query, similarity_measure):
    if not os.path.exists(vectorstore_path):
        return []
    
    # Initialize the embeddings object
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.load_local(vectorstore_path, embeddings, allow_dangerous_deserialization=True)
    
    if similarity_measure == "Cosine Similarity":
        results = vector_store.similarity_search(query)
    elif similarity_measure == "Jaccard Similarity":
        results = []
        # Implement Jaccard similarity logic here
    elif similarity_measure == "Keyword Search":
        results = []
        # Implement keyword search logic here
    else:
        results = []
    
    return results

# Streamlit Layout
st.set_page_config(layout="wide")

# Sidebar
with st.sidebar:
    st.header("Options")
    uploaded_files = st.file_uploader("Upload files", accept_multiple_files=True, type=["pdf"])
    if uploaded_files:
        add_files_to_dataset([os.path.join(dataset_dir, uploaded_file.name) for uploaded_file in uploaded_files])
        st.success("Files uploaded successfully")
    
    # Similarity Measure Dropdown
    similarity_measure = st.selectbox("Select similarity measure", ["Cosine Similarity", "Jaccard Similarity", "Keyword Search"])
    
    # Dataset Button
    if st.button('Dataset'):
        files = get_all_files()
        selected_file = st.selectbox("Select a file", files)
    
    # Converted Files Button
    if st.button('Converted Files'):
        converted_files = get_converted_files()
        st.write("Converted Files:")
        for file in converted_files:
            st.write(f"📄 {file}")

    # Remaining Files Button
    if st.button('Remaining Files'):
        converted_files = get_converted_files()
        all_files = get_all_files()
        remaining_files = list(set(all_files) - set(converted_files))
        st.write("Remaining Files:")
        for file in remaining_files:
            st.write(f"📄 {file}")

# Main Window
st.title("PDF to Vector Store Converter")

# Selected Files for Processing
converted_files = get_converted_files()
remaining_files = list(set(get_all_files()) - set(converted_files))
selected_files = st.multiselect("Select files to convert to vector store", remaining_files)

# Process Button
if st.button("Convert Selected Files"):
    if selected_files:
        pdf_files = [os.path.join(dataset_dir, f) for f in selected_files]
        raw_text = get_pdf_text(pdf_files)
        text_chunks = get_text_chunks(raw_text)
        create_vector_store(text_chunks)
        log_converted_files(selected_files)
        st.success("Files converted and added to vector store.")
    else:
        st.warning("No files selected for conversion.")

# Query Input Field
st.header("Query and Similarity Search")
query = st.text_input("Enter your query")
if query:
    results = query_faiss(query,similarity_measure)
    if results:
        st.write("Search Results:")
        for result in results:
            st.write(result)  # Display the result; adjust based on the actual result format
    else:
        st.write("No results found.")

# Display Analytics
st.header("FAISS Analytics")
faiss_stats = get_faiss_stats()
st.write(f"**Chunks**: {faiss_stats['chunks']}")
st.write(f"**Embeddings**: {faiss_stats['embeddings']}")
st.write(f"**Documents**: {faiss_stats['documents']}")

# Display Chunks and Embeddings
st.header("Chunks and Embeddings")
with st.expander("Show Chunks and Embeddings"):
    embeddings = get_faiss_embeddings()
    embeddings_text = "\n".join([str(embedding) for embedding in embeddings])
    st.text_area("Chunks and Embeddings", value=embeddings_text, height=300)

# Log File
if os.path.exists(log_file):
    with open(log_file, 'r') as file:
        log_contents = file.read()
else:
    log_contents = "No logs available."

st.header("Log File")
st.text_area("Log", value=log_contents, height=200)
