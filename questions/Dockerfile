FROM python:3.12-slim

WORKDIR /questions

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . /questions
