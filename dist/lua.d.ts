export declare const INCR_WITH_EXPIRE = "\nlocal v = redis.call(\"INCR\", KEYS[1])\nif v == 1 then\n  redis.call(\"EXPIRE\", KEYS[1], tonumber(ARGV[1]))\nend\nreturn v\n";
