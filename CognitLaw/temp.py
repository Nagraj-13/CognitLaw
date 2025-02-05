import requests
import logging
def get_documents_by_keyword(api_token, query, page_num=0):
    """
    Fetch documents from Indian Kanoon API based on the given keyword and format the response.
    
    :param api_token: str - API Token for authentication
    :param query: str - Search query
    :param page_num: int - Page number (default: 0)
    :return: list - Formatted list of search results
    """
    url = "https://api.indiankanoon.org/search/"
    headers = {
        "Authorization": f"Token {api_token}",
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    payload = {
        "formInput": query,
        "pagenum": page_num
    }
    
    response = requests.post(url, headers=headers, data=payload)
    
    if response.status_code != 200:
        return {"error": f"Failed to fetch documents. Status Code: {response.status_code}", "details": response.text}
    
    data = response.json()
    formatted_results = {
        "keyword": query,
        "cases": []
    }
    
    for doc in data.get("docs", []):
        formatted_results["cases"].append({
            "text": f"{doc.get('title', 'Unknown Title')} on {doc.get('publishdate', 'Unknown Date')}",
            "href": f"https://indiankanoon.org/doc/{doc.get('tid', '')}/",
            "searchElements": "judgments"
        })
    
    return [formatted_results]


# api_token = "5caa640449df6447f5993b5e019989177e950687"

def get_case_details_by_docid(doc_ids):
    """
    Fetch case details for each document ID from the Indian Kanoon API.

    :param doc_ids: list - List of document IDs (tid) for which case details are needed
    :return: list - Formatted list of case details for each document
    """
    url_template = "https://api.indiankanoon.org/origdoc/{}/"
    headers = {
        "Authorization": f"Token {api_token}",
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    result_data = []
    
    for doc_id in doc_ids:
        url = url_template.format(doc_id)
        logging.info(f"Fetching case details for document ID: {doc_id}")
        
        try:
            response = requests.post(url, headers=headers)
            response.raise_for_status()

            if response.status_code != 200:
                logging.error(f"Failed to fetch document {doc_id}. Status Code: {response.status_code}")
                continue

            data = response.json()
            
            result_data.append({
                'text': data.get('title', 'Unknown Title'),
                'publishdate': data.get('publishdate', 'Unknown Date'),
                'href': url,
                'searchElements': "judgments",
                'data': data
            })
            
            logging.info(f"Successfully fetched details for document ID: {doc_id}")
        
        except Exception as e:
            logging.error(f"Error fetching details for document ID {doc_id}: {e}")

    return result_data


# Example usage:
# query = "Right to Information"
# print(get_documents_by_keyword(api_token, query))

case_details = get_case_details_by_docid([1083556])
print(case_details)