module.exports = {
  datastores: {
    default: {
      adapter: "sails-mysql",
      url: "mysql://root:@localhost:3306/legalofe_sails",
    },
  },

  custom: {
    // nodemailerPass: 'rnO.gTE?)0U$'
  },
};
// url: 'mysql://legalofe_lofe:gGaeBOK!HXvr@localhost:3306/legalofe_sails',

/// url: 'mysql://legalofe_sailor:]uEhf_ErCc8r@68.66.248.40:3306/legalofe_sails',

//cKBa6Tvm12n3dj6y - legalofe
/*
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Tekno08y@';
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'Tekno08y@';

mysqld --defaults-file="C:\\ProgramData\\MySQL\\MySQL Server 8.0\\my.ini" --init-file=C:\\mysql-init.txt --console

mysqld --init-file=C:\\mysql-init.txt --console

SET PASSWORD FOR root@'localhost' = PASSWORD('Tekno08y@');

mysqld
         --defaults-file="C:\\ProgramData\\MySQL\\MySQL Server 5.7\\my.ini"
         --init-file=C:\Users\admin\Documents\mysql-init.txt
USE mysql;
UPDATE mysql.user SET Password = PASSWORD('Tekno08y@') WHERE User = 'root';
FLUSH PRIVELEGES;




UPDATE mysql.user SET Password=PASSWORD('Tekno08y@') WHERE User='root';
UPDATE user SET password=PASSWORD('Tekno08y@') WHERE user ='root'; FLUSH PRIVILEGES;

mysqladmin -u root flush-privileges password "Tekno08y@"

SET PASSWORD FOR 'root'@'localhost' = 'Tekno08y@';

SET PASSWORD FOR 'myuser'@'localhost' = 'my_new_password';


GRANT ALL PRIVILEGES ON *.* TO 'admin_root'@'localhost';


ALTER USER 'user_legalofe'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';

CREATE USER 'admin_root'@'localhost' IDENTIFIED BY 'Tekno08y@';

grant all privileges on mydb.* to root@'localhost';

UPDATE mysql.user SET Grant_priv='Y', Super_priv='Y' WHERE User='admin_root';

*/
