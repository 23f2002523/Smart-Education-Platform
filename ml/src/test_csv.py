import pandas as pd

# Test CSV loading
quiz = pd.read_csv('../datasets/quizattempts.csv', quotechar='"', skipinitialspace=True)
print("Quiz columns:", quiz.columns.tolist())
print("\nFirst row:")
print(quiz.head(1))
