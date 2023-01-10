FROM python:3.9-buster

EXPOSE 8080

COPY ./requirements.txt /tmp/requirements.txt

RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY src /app

WORKDIR /app
USER nobody

CMD ["uwsgi", "--http-socket", ":8080", "--wsgi-file", "main.py", "--callable", "app", "--master", "--processes", "1", "--threads", "2"]
