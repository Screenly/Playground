FROM python:3.10.4-bullseye

EXPOSE 5000

COPY ./requirements.txt /tmp/requirements.txt

RUN pip install -r /tmp/requirements.txt

COPY src /app

WORKDIR /app
USER nobody

CMD ["python", "main.py"]