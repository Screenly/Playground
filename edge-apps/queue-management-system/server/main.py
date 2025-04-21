@app.get("/display")
async def get_till_status():
    """Get the current status of all tills."""
    # In a real system, this would query a database or other service
    # For now, we'll return a static list of tills
    return {"available_tills": ["1", "2", "4"], "busy_tills": ["3"]}
