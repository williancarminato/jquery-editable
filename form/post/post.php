<?php

//Remember: This file is only for demonstration, in a real application you have to worry about security issues
$html = "<h2>".$_POST['title']."</h2>";
$html .= "<p>".$_POST['content']."</p>";

echo json_encode(array('html' => $html));

