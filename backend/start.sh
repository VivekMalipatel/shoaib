#!/bin/bash
export $(grep -v '^#' .env | xargs)
python run.py