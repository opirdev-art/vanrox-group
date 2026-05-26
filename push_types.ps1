git add .
$tree = git write-tree
$parent = git rev-parse HEAD
$commit = "feat: sync database types and Supabase configuration" | git commit-tree $tree -p $parent
git update-ref refs/heads/main $commit
git push origin main
