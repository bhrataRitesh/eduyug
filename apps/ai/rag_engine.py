import os
import psycopg2
from pgvector.psycopg2 import register_vector
from typing import List, Dict, Any, Optional
import config

class RagEngine:
    def __init__(self):
        self.db_url = config.DATABASE_URL
        self.openai_key = config.OPENAI_API_KEY
        self.client = None
        if self.openai_key:
            from openai import OpenAI
            self.client = OpenAI(api_key=self.openai_key)

    def get_connection(self):
        conn = psycopg2.connect(self.db_url)
        register_vector(conn)
        return conn

    def generate_embedding(self, text: str) -> List[float]:
        if self.client:
            response = self.client.embeddings.create(
                input=text,
                model=config.EMBEDDING_MODEL
            )
            return response.data[0].embedding
        # Deterministic 1536-dim mock vector for offline/test environments
        import hashlib
        h = hashlib.sha256(text.encode()).digest()
        base = [float(b) / 255.0 for b in h]
        return (base * (1536 // len(base) + 1))[:1536]

    def search_transcript_chunks(
        self,
        course_id: str,
        query: str,
        lesson_id: Optional[str] = None,
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        query_embedding = self.generate_embedding(query)
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                if lesson_id:
                    sql = """
                        SELECT id, lesson_id, start_time_seconds, end_time_seconds, content,
                               1 - (embedding <=> %s::vector) AS similarity
                        FROM transcript_chunks
                        WHERE course_id = %s AND lesson_id = %s
                        ORDER BY embedding <=> %s::vector
                        LIMIT %s;
                    """
                    cur.execute(sql, (query_embedding, course_id, lesson_id, query_embedding, top_k))
                else:
                    sql = """
                        SELECT id, lesson_id, start_time_seconds, end_time_seconds, content,
                               1 - (embedding <=> %s::vector) AS similarity
                        FROM transcript_chunks
                        WHERE course_id = %s
                        ORDER BY embedding <=> %s::vector
                        LIMIT %s;
                    """
                    cur.execute(sql, (query_embedding, course_id, query_embedding, top_k))

                rows = cur.fetchall()
                results = []
                for row in rows:
                    results.append({
                        "chunk_id": str(row[0]),
                        "lesson_id": str(row[1]),
                        "start_time_seconds": float(row[2]),
                        "end_time_seconds": float(row[3]),
                        "content": row[4],
                        "similarity": float(row[5])
                    })
                return results
        finally:
            conn.close()

    def generate_answer(self, query: str, context_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        citations = []
        context_str = ""

        for c in context_chunks:
            start_m = int(c["start_time_seconds"] // 60)
            start_s = int(c["start_time_seconds"] % 60)
            ts_label = f"[{start_m:02d}:{start_s:02d}]"
            context_str += f"\n- {ts_label}: {c['content']}"
            citations.append({
                "chunk_id": c["chunk_id"],
                "lesson_id": c["lesson_id"],
                "start_time_seconds": c["start_time_seconds"],
                "end_time_seconds": c["end_time_seconds"],
                "similarity": c["similarity"],
                "timestamp_label": ts_label
            })

        if self.client:
            system_prompt = (
                "You are the expert technical AI Tutor for EduYug. "
                "Answer the learner's query using ONLY the provided transcript excerpts below. "
                "Always cite the exact timestamp in brackets like [MM:SS] where the explanation occurs. "
                "If the answer is not in the excerpts, clearly state that the topic is not covered in this section."
            )
            user_prompt = f"Transcript Excerpts:\n{context_str}\n\nLearner Question: {query}"

            response = self.client.chat.completions.create(
                model=config.LLM_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2
            )
            answer = response.choices[0].message.content
        else:
            # Fallback simulated answer with real citations from pgvector
            if citations:
                primary = citations[0]
                answer = (
                    f"According to the lesson transcript at {primary['timestamp_label']}, "
                    f"this concept is implemented directly: '{context_chunks[0]['content'][:140]}...'. "
                    f"Click the citation above to jump directly to this explanation."
                )
            else:
                answer = "This topic is explained throughout the course curriculum. Review the video lessons for practical examples."

        return {
            "answer": answer,
            "citations": citations
        }
