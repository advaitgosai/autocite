## autocite

open-source citation tool for TeX documents (or any text using \cite{}). plug and play to generate a .bib file.

complete keyboard-based navigation if desired; just press tab and enter. 

to run this project locally:

1. clone the repo:
   ```
   git clone https://github.com/advaitgosai/autocite.git
   cd autocite
   ```

2. install dependencies:
   ```
   npm install
   ```

3. start the dev server:
   ```
   npm run dev
   ```

this will start both the react dev server and the express server concurrently.


### contributing

contributions are welcome, anything from a star to submitting a PR.

ideas:
- llm mode to avoid api downtime or just to see how it does 
- auto standardize conference/journal/author names in a user pasted bib
- code formatter for the tex editor 
- full on rendering + collab?


