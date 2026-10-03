from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import config
from rag_engine import RagEngine

app = FastAPI(
    title="EduYug AI Service",
    description="ASR Transcription & Scoped pgvector RAG Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_engine = RagEngine()

class RagQueryRequest(BaseModel):
    course_id: str
    lesson_id: Optional[str] = None
    query: str

class TranscriptChunkInput(BaseModel):
    chunk_index: int
    start_time_seconds: float
    end_time_seconds: float
    content: str

class TranscribeIngestRequest(BaseModel):
    media_asset_id: str
    course_id: str
    lesson_id: str
    full_text: str
    chunks: List[TranscriptChunkInput]

@app.get("/health")
def health():
    return {"status": "ok", "service": "EduYug AI Engine", "model": config.LLM_MODEL}

@app.post("/api/v1/ai/rag/query")
def query_rag(req: RagQueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        chunks = rag_engine.search_transcript_chunks(
            course_id=req.course_id,
            query=req.query,
            lesson_id=req.lesson_id,
            top_k=4
        )
        result = rag_engine.generate_answer(query=req.query, context_chunks=chunks)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query execution failed: {str(e)}")

@app.post("/api/v1/ai/transcribe")
def ingest_transcript(req: TranscribeIngestRequest):
    conn = rag_engine.get_connection()
    try:
        with conn.cursor() as cur:
            # 1. Insert into transcripts
            cur.execute("""
                INSERT INTO transcripts (media_asset_id, course_id, lesson_id, language, full_text)
                VALUES (%s, %s, %s, 'en', %s)
                RETURNING id;
            """, (req.media_asset_id, req.course_id, req.lesson_id, req.full_text))
            transcript_id = cur.fetchone()[0]

            # 2. Insert chunks with embeddings
            for chunk in req.chunks:
                embedding = rag_engine.generate_embedding(chunk.content)
                cur.execute("""
                    INSERT INTO transcript_chunks 
                    (transcript_id, course_id, lesson_id, chunk_index, start_time_seconds, end_time_seconds, content, embedding)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s::vector);
                """, (
                    transcript_id,
                    req.course_id,
                    req.lesson_id,
                    chunk.chunk_index,
                    chunk.start_time_seconds,
                    chunk.end_time_seconds,
                    chunk.content,
                    embedding
                ))

            conn.commit()
            return {"success": True, "transcript_id": str(transcript_id), "chunks_indexed": len(req.chunks)}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Transcription ingestion failed: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=config.AI_PORT, reload=True)
