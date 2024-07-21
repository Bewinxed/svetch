#!/bin/bash

# Output file
output_file="combined_code.txt"

# Empty the output file if it already exists
> "$output_file"

# Function to add a file's content to the output
add_file_content() {
    local file=$1
    echo "==== File: $file ====" >> "$output_file"
    cat "$file" >> "$output_file"
    echo -e "\n\n" >> "$output_file"
}

# Add src/generator.ts
if [ -f "src/generator.ts" ]; then
    add_file_content "src/generator.ts"
else
    echo "src/generator.ts not found" >> "$output_file"
fi

# Add files from src/utils directory
if [ -d "src/utils" ]; then
    for file in src/utils/*; do
        if [ -f "$file" ]; then
            add_file_content "$file"
        fi
    done
else
    echo "src/utils directory not found" >> "$output_file"
fi

# Add files from src/types directory
if [ -d "src/types" ]; then
    for file in src/types/*; do
        if [ -f "$file" ]; then
            add_file_content "$file"
        fi
    done
else
    echo "src/types directory not found" >> "$output_file"
fi

echo "All files have been combined into $output_file"