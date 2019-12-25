yarn build && yarn build-site
STATUS="$(git status)"

if [[ $STATUS == *"nothing to commit, working tree clean"* ]]
then
    sed -i "" '/site/d' ./.gitignore
    git add .
    git commit -m "Deployment"
    git push origin `git subtree split --prefix site master`:gh-pages --force
    git reset HEAD~
    git checkout .gitignore
else
    echo "Need clean working directory to publish"
fi