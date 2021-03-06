<?php
# ABSOLUTE ROOT PATH #
$localpath = strtolower($_SERVER['PHP_SELF']);
$absolutepath = strtolower($_SERVER['SCRIPT_FILENAME']);
$absolutepath = str_replace('\\', '/', $absolutepath); // fix Windows slashes
$docroot = substr($absolutepath, 0, stripos($absolutepath, $localpath));
$docroot.="";

try {
	$db = new PDO('sqlite:db.sqlite');
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
	echo $e->getMessage()."@".'sqlite:'.$docroot.'data/db.sqlite';
	exit;
}

if(isset($_GET['what'])) {

	switch($_GET['what']) {
		case "menu":

			$sth = $db->prepare("SELECT * FROM menu");
			$sth->execute();
			$result = $sth->fetchAll();
			echo json_encode($result);

			break;
		case "order":

			$q = $db->prepare("INSERT INTO orders (owner,burger_id) VALUES('".$_GET['name']."','".$_GET['id']."')");
			$q->execute();

			echo $q?TRUE:FALSE;

			break;

		case "cancel":

			$q = $db->prepare("DELETE FROM orders WHERE id = ".$_GET['id']);
			$q->execute();

			echo $q?TRUE:FALSE;

			break;

		case "orders":

			$sth = $db->prepare("SELECT orders.id as id, owner, burger_id, name, size FROM orders,menu WHERE orders.burger_id = menu.id AND timestamp >= date('now','-1 day') AND timestamp < date('now','+1 day')");
			$sth->execute();
			$result = $sth->fetchAll();
			echo json_encode($result);

			break;

		case "popular":

			$sth = $db->prepare("SELECT name, num FROM(SELECT m.name AS name, count(m.name) AS num FROM menu AS m, orders AS o WHERE o.burger_id = m.id GROUP BY m.name) ORDER BY num DESC LIMIT 3");
			$sth->execute();
			$result = $sth->fetchAll();
			echo json_encode($result);

			break;
	}


}

?>