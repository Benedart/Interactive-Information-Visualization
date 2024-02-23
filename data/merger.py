# Description: Merges the two datasets and saves the result to data/merged.csv
import pandas as pd

youth = pd.read_csv('data/youth.csv')
ed_vs_ne = pd.read_csv('data/ed-vs-ne.csv')

merged = pd.merge(ed_vs_ne, youth, on='Country', how='left')

# all columns except 'Country' are integers
merged[merged.columns[1:]] = merged[merged.columns[1:]].astype('Int64')

merged.to_csv('data/merged.csv', index=False)