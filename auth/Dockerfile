FROM python:3.12-slim

WORKDIR /auth

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . /auth

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "80", "--reload"]