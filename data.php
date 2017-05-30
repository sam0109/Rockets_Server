<?php
  // SCRIPT FOR DATA RETREIVAL
  // MODES:                    
  //        since    - retrieve data since timestamp
  //        info     - retrieve info on table format

  // ARGUMENTS TO SPECIFY [in which mode]
  // args:
  //       timestamp  - timestamp of data [since]
  //       table      - which table to use [since, info]
  //       db         - which database to use (default Test) [since, info]
  //       maxRPS     - The maximum number of rows to return per second [since]

  $endl = "\n";
  $servername = "127.0.0.1";
  $username = "root";
  $password = "RocketsProject"; //YOUR OWN PASSWORD

  $db = "Test"; // default database name
  $sql = "";    // query string to mysql
  $maxRPS = 10; // default maxRPS

  if (array_key_exists("table", $_REQUEST)) {
    $table = $_REQUEST["table"];
  } else {
    echo "'table' argument not found";
    exit(0);
  }

  if (array_key_exists("mode", $_REQUEST)) {
    $mode = $_REQUEST["mode"];
  } else {
    echo "'mode' argument not found";
    exit(0);
  }

  if (array_key_exists("db", $_REQUEST)) {
    $db = $_REQUEST["db"];
  } 

  if (array_key_exists("maxRPS", $_REQUEST)) {
    $maxRPS = $_REQUEST["maxRPS"];
  } 

  $conn  = mysqli_connect($servername, $username, $password, $db);

  if (!$conn) {
    die("Wrong arguments, failed to connect to the specified database: " . $db . $endl);
  }

  /* SINCE MODE QUERY GENERATOR */
  if ($mode == "since") {    
    if (array_key_exists("id", $_REQUEST)) {
      $id = $_REQUEST["id"];
    } 
    else {
      echo "'id' argument not found";
      exit(0);
    }

    $sql = "SELECT * FROM " . $table . " WHERE id > " . $id . " LIMIT 10000";
    $queryResult = mysqli_query($conn, $sql);
    
    $result = null;
    $count = 0;
    $notFirst = FALSE;
    $timeInterval = 1 / $maxRPS;
    $time_window_end = null;
    $most_recent_id = 0;
    while ($row = mysqli_fetch_array($queryResult, MYSQLI_NUM)) {
      $most_recent_id = $row[0];
      if(is_null($result)){
        $result = array_fill(0, count($row) - 1, 0);
        $time_window_end = $row[1] + $timeInterval;
      }

      $count += 1;
      for ($i = 1; $i < count($row); ++$i){
        $result[$i] += $row[$i];
      }

      if($row[1] >= $time_window_end){
        if($notFirst){
          echo $endl;
        } else{
          $notFirst = TRUE;
        }

        $result[0] = $row[0];
        for ($i = 1; $i < count($result); ++$i){
          $result[$i] = $result[$i] / $count;
        }
        echo implode(",", $result);
        $result = null;
        $count = 0;
      }
    }
    if(!is_null($result)){
      if($notFirst){
        echo $endl;
      }

      $result[0] = $most_recent_id;
      for ($i = 1; $i < count($result); ++$i){
        $result[$i] = $result[$i] / $count;
      }
      echo implode(",", $result);
    }
  }

  /* INFO MODE QUERY GENERATOR */
  elseif ($mode == "info") {
    $sql = "SELECT id FROM " . $table . " ORDER BY id DESC LIMIT 1";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    foreach ($row as $key => $value) {
      echo $value . $endl;
    }

    $sql = "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_name = '" . $table . "';";
    $result = mysqli_query($conn, $sql);
    $to_print = "";
    while ($row = mysqli_fetch_assoc($result)) {
      foreach ($row as $key => $value) {
        $to_print .= $value . $endl;
      }
    }
    echo substr($to_print, 0, strlen($line)-1); //drop trailing newline
  }
  mysqli_close($conn);
?>