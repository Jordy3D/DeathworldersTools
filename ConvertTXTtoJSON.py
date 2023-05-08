import json

# ask user for input file name
input_file = input("Enter the name of the input file: ")
# ask user for output file name
output_file = input("Enter the name of the output file: ")

lines = []
# open input file
with open(input_file, "r", encoding="utf-8") as file:
    
    for i, line in enumerate(file):
        # if the line isn't empty
        if line.strip():
            # clean up line
            line = line.strip()
            line = line.replace("’", "'")
            # append the line to the list
            lines.append(line.strip())

#export to JSON file, where the JSON looks like this:
# {
#   "book": "Xiu Chang",
#   "chapter": 1,
#   "chapterTitle": "Monkeys Reaches Stars",
#   "content": [
#   {
#     "tag": "p",
#     "class": "",
#     "text": "Once upon a time, there was a monkey who lived in a tree that was very tall. The monkey was very happy with his tree, but he was also very curious. He wondered what it would be like to touch the stars."
#   }
#]

# create a dictionary
data = {}
# add the book name
data["book"] = input("Enter the name of the book: ")
# add the chapter number
data["chapter"] = int(input("Enter the chapter number: "))
# add the chapter title
data["chapterTitle"] = input("Enter the chapter title: ")
# add the content
data["content"] = []

# loop through the lines
for line in lines:
    # create a dictionary for each line
    line_dict = {}
    # add the tag
    line_dict["tag"] = "p"
    # add the class
    line_dict["class"] = ""
    # add the text
    line_dict["text"] = line
    # append the dictionary to the list
    data["content"].append(line_dict)

# open the output file
with open(output_file, "w", encoding="utf-8") as file:
    # write the data to the file
    json.dump(data, file, ensure_ascii=False, indent=2)

print("Done!")
input("\nPress enter to exit.")