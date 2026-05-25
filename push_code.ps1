git add .
$tree = git write-tree
$parent = git rev-parse HEAD
$commit = "feat: initial project structure with refined schema" | git commit-tree $tree -p $parent
git update-ref refs/heads/main $commit
git push origin main
