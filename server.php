<?php
	
	$command = $_REQUEST["command"];

	// sleep(1);
	$result = array ('message'=> 'SYNTAX ERROR: '.$command);
	die(json_encode($result));
	