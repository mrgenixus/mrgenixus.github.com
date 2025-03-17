if !(which lynx); then
  brew install lynx;
fi
pid="";

bundle exec jekyll build

cat _site/skills.html | lynx -stdin -dump > $(git root)/skills-cache.txt

pkill -P $$
