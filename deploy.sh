# From https://gist.github.com/tduarte/eac064b4778711b116bb827f8c9bef7b
git subtree split --prefix examples -b gh-pages
git push -f origin gh-pages:gh-pages
git branch -D gh-pages
