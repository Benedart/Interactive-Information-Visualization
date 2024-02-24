# Description: Merges the two datasets and saves the result to data/merged.csv
import pandas as pd

csv1 = pd.read_csv('data/youth_education.csv')
csv2 = pd.read_csv('data/education-vs-employment.csv')

merged = pd.merge(csv1, csv2, on='Country', how='left')

merged.to_csv('data/merged.csv', index=False)