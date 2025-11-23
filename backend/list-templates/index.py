'''
Business: Get list of all templates from database
Args: event - dict with httpMethod
      context - object with attributes: request_id, function_name
Returns: HTTP response with templates list
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    query = "SELECT id, name, created_at, updated_at, LENGTH(file_content) FROM templates ORDER BY created_at DESC"
    cursor.execute(query)
    rows = cursor.fetchall()
    
    templates = []
    for row in rows:
        template_id, name, created_at, updated_at, file_size = row
        templates.append({
            'id': template_id,
            'name': name,
            'createdAt': created_at.isoformat() if created_at else None,
            'updatedAt': updated_at.isoformat() if updated_at else None,
            'fileSize': file_size
        })
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'templates': templates})
    }