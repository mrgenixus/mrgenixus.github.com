for file in $(ls _experience/); do
  seq_no=$(echo $file | cut -f1 -d- | sed 's/^\s*//g')
  if [ "$(ls _experience/$seq_no* | wc -w)" -ne "1" ]; then
    increment=$(($(echo $seq_no | sed 's/^0*//g') + 1))
    echo "increment: \"$increment\""
    replacement=$(printf "%03d" $increment)
    echo "replacement: \"$replacement\""
    echo "seq_no: \"$seq_no\" $(echo "$seq_no" | $(echo "sed s/$seq_no/$replacement/g"))"
    mv _experience/$file _experience/$(echo $file | $(echo "sed s/$seq_no/$replacement/g"))
  fi
done
