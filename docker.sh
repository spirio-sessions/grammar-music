#!/bin/bash

docker build -t grammar-music .
docker run -p 8080:8080 grammar-music