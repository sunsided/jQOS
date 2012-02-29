<?php
	
	$command = $_REQUEST["command"];

	// Sonderkommandos
	if ($command == "date") {
		die(json_encode(array('message' => date(DATE_RFC822))));
	}
	elseif ($command == "meow") {
		die(json_encode(array('message' => ':3')));
	}
	elseif ($command == "php") {
		die(json_encode(array('message' => phpversion())));
	}
	
	// generischer Fall
	$result = array ('message'=> 'SYNTAX ERROR');
	die(json_encode($result));
	