/* LinuxLab curriculum. All scenarios are simulated: no shell commands are executed. */
(function () {
'use strict';
const mk = (id, title, tag, level, desc, lessons, raw, icon) => ({
  id, title, tag, level, desc, lessons, icon,
  drills: raw.trim().split('\n').filter(Boolean).map(line => {
    const [key, prompt, answers, hint, why] = line.split('§').map(x => x.trim());
    return { id: `${id}-${key}`, moduleId:id, prompt,
      answers:answers.split('‖').map(s => s.trim()), hint, why, level };
  })
});

const modules = [
mk('files','Навигация и файлы','ОСНОВЫ',1,'Уверенно перемещайся по файловой системе Ubuntu и работай с каталогами.',[
  ['Ориентирование','pwd показывает текущий каталог, ls — его содержимое, cd меняет рабочий каталог. Абсолютные пути начинаются с /, относительные отсчитываются от текущего каталога.','pwd\nls -la /etc\ncd /var/log'],
  ['Изменения без сюрпризов','mkdir -p создаёт вложенные каталоги. cp копирует, mv перемещает или переименовывает. rm -r удаляет рекурсивно, но не имеет корзины. Перед удалением сначала проверь путь командой ls.','mkdir -p ~/lab/config\ncp -a /etc/hosts ~/lab/hosts.bak'],
  ['Как думать','Для начала установи контекст: где ты находишься, что лежит рядом, к кому принадлежит файл. Не начинай диагностику с изменения системы.','pwd\nls -lah\nstat /etc/hosts']
],`
01§Покажи текущий рабочий каталог§pwd§Вспомни print working directory.§pwd возвращает полный путь текущей директории.
02§Покажи подробное содержимое текущего каталога, включая скрытые файлы§ls -la‖ls -al‖ls -l -a‖ls -a -l§Понадобятся флаги -l и -a.§-l даёт атрибуты, -a показывает имена, начинающиеся с точки.
03§Перейди в каталог /var/log§cd /var/log§Для перемещения используется cd.§cd меняет текущую директорию текущей оболочки.
04§Перейди в домашний каталог§cd ~‖cd§Домашний каталог обозначается тильдой.§cd без аргумента также переходит в домашний каталог.
05§Создай вложенный каталог ~/lab/logs одной командой§mkdir -p ~/lab/logs§Опция -p создаёт промежуточные директории.§mkdir -p не ругается, если каталог уже существует.
06§Создай пустой файл test.log§touch test.log§Команда touch обновляет время изменения или создаёт файл.§touch создаёт пустой файл при отсутствии.
07§Скопируй /etc/hosts в ~/hosts.bak§cp /etc/hosts ~/hosts.bak§Используй cp с источником и назначением.§cp копирует, но не изменяет исходный файл.
08§Переименуй old.log в new.log§mv old.log new.log§Используй mv.§mv перемещает и переименовывает.
09§Посмотри размер файлов удобным для чтения способом§ls -lh‖ls -hl‖ls -l -h‖ls -h -l§К ls -l добавь human-readable.§-h преобразует размеры в K, M, G.
10§Покажи тип файла /bin/bash§file /bin/bash§Есть команда, которая определяет тип файла.§file исследует содержимое/сигнатуру файла.
11§Покажи подробную информацию о /etc/hosts§stat /etc/hosts§Команда начинается на st.§stat показывает права, inode, время изменения, владельца.
12§Найди исполняемый файл nginx в PATH§command -v nginx‖which nginx§Можно спросить оболочку, где находится команда.§command -v обычно предпочтительнее which для shell-скриптов.
`, 'folder'),
mk('reading','Логи, текст и поиск','ОСНОВЫ',1,'Вывод, фильтрация и поиск по файлам — главные инструменты расследования.',[
  ['Чтение без редактирования','cat подходит для маленького файла, less — для длинного, head и tail — для начала и конца. tail -f следит за дописываемым логом.','less /var/log/syslog\ntail -n 100 /var/log/syslog'],
  ['Фильтрация','grep находит строки, -i игнорирует регистр, -R ищет рекурсивно. Символ | передаёт стандартный вывод одной команды следующей.','grep -i error /var/log/syslog\nps aux | grep nginx'],
  ['Поиск объектов','find ищет файлы по имени, типу, времени и размеру. Если нужен только путь известной команды — сначала command -v.','find /var/log -type f -name "*.log"']
],`
01§Покажи последние 50 строк /var/log/syslog§tail -n 50 /var/log/syslog‖tail -50 /var/log/syslog§tail с указанием количества строк.§tail -n ограничивает вывод с конца файла.
02§Следи за новыми строками /var/log/syslog в реальном времени§tail -f /var/log/syslog§Нужен follow, флаг -f.§tail -f остаётся подключённым к файлу и выводит новые строки.
03§Открой /var/log/syslog с постраничной навигацией§less /var/log/syslog§Команда less.§В less можно искать через /, выходить через q.
04§Найди слово error в app.log без учёта регистра§grep -i error app.log§Нужен grep с флагом ignore case.§grep -i полезен для Error, ERROR и error.
05§Найди строку failed во всех файлах /var/log рекурсивно§grep -R failed /var/log§Рекурсивный grep.§-R обходит вложенные каталоги и ссылки (внимательно с большими деревьями).
06§Покажи первые 20 строк /etc/passwd§head -n 20 /etc/passwd§Противоположность tail.§head читает начало файла.
07§Посчитай число строк в /etc/passwd§wc -l /etc/passwd§Команда word count.§wc -l показывает количество строк.
08§Найди все .conf-файлы в /etc§find /etc -type f -name "*.conf"§find + -type f + -name.§Кавычки не дают shell раскрыть шаблон раньше find.
09§Выведи только строки c ssh из /var/log/auth.log§grep ssh /var/log/auth.log§Нужна утилита grep.§grep показывает только совпавшие строки.
10§Покажи только имя пользователя из каждой строки /etc/passwd§cut -d: -f1 /etc/passwd§Разделитель двоеточие, первое поле.§cut извлекает нужные поля, не модифицируя файл.
11§Отсортируй и убери дубли в файле names.txt§sort names.txt | uniq§Сначала отсортируй, затем uniq.§uniq удаляет соседние повторы; без сортировки это не все дубли.
`, 'search'),
mk('permissions','Права и пользователи','БАЗА',1,'UID/GID, sudo, владельцы и безопасная диагностика Permission denied.',[
  ['Модель доступа','У файла есть владелец, группа и набор rwx для user/group/other. Для каталога x означает право прохода, а не запуск. Права родительских каталогов тоже важны.','ls -ld /srv /srv/app\nid'],
  ['Меняем осознанно','chmod устанавливает биты доступа, chown — владельца и группу. Не используй chmod 777 как универсальное лечение. sudo запускает отдельную команду с повышенными привилегиями.','sudo chown www-data:www-data /srv/app\nsudo chmod 750 /srv/app'],
  ['Диагностика','namei -l раскладывает путь по каталогам и показывает ограничения на каждом уровне. Проверяй права прежде, чем менять их.','namei -l /srv/app/config.yml']
],`
01§Покажи текущего пользователя§whoami§Команда who am I.§whoami печатает эффективное имя пользователя.
02§Покажи UID и группы текущего пользователя§id§Короткая команда из двух букв.§id показывает uid, gid и дополнительные группы.
03§Покажи права и владельца /etc/ssh/sshd_config§ls -l /etc/ssh/sshd_config§Для файла достаточно подробного ls.§ls -l показывает owner/group/permissions.
04§Покажи права самого каталога /srv/app§ls -ld /srv/app‖ls -dl /srv/app§Важно не показать его содержимое.§-d относится к каталогу, а не к его файлам.
05§Выдай владельцу право выполнения файла script.sh§chmod u+x script.sh§u — user, +x — исполнение.§Символьная форма меняет только указанный бит.
06§Выдай файлу config.txt права rw-r-----§chmod 640 config.txt§Числа: 4 чтение, 2 запись, 1 исполнение.§640: владелец 6, группа 4, остальные 0.
07§Смени владельца /srv/app на ubuntu§sudo chown ubuntu /srv/app§Используй chown.§chown меняет собственника, sudo нужен для чужих файлов.
08§Смени владельца и группу каталога /srv/app на www-data§sudo chown www-data:www-data /srv/app§Имя:имя после chown.§Рекурсивный -R здесь не нужен: меняем только каталог.
09§Проверь права на всех компонентах пути /srv/app/data/file§namei -l /srv/app/data/file§Команда namei.§namei -l особенно полезен при загадочном Permission denied.
10§Выведи список групп пользователя ubuntu§groups ubuntu‖id ubuntu§Используй groups либо id.§Группы влияют на доступ к файлам и сокетам.
11§Запусти команду id от имени www-data§sudo -u www-data id§sudo -u задаёт пользователя.§Это удобный способ проверить контекст сервисного аккаунта.
`, 'shield'),
mk('processes','Процессы и ресурсы','БАЗА',2,'Находи зависшие процессы, причины нагрузки и ограничения ресурсов.',[
  ['Процессы','ps aux показывает снимок процессов; top обновляет данные. pgrep ищет PID по имени. kill посылает сигнал, а не обязательно «убивает».','ps aux\ntop\npgrep -a nginx'],
  ['Нагрузка','uptime показывает load average за 1, 5 и 15 минут; free -h — доступную память. Высокая нагрузка не обязательно означает перегрузку CPU: возможен I/O wait.','uptime\nfree -h\nvmstat 1 5'],
  ['Контроль','SIGTERM (15) предлагает завершиться штатно, SIGKILL (9) — жёсткое завершение без обработки. Сначала оцени влияние на сервис.','kill -TERM 1234']
],`
01§Покажи полный список процессов§ps aux§Команда ps с распространёнными опциями a,u,x.§ps aux — моментальный снимок.
02§Найди PID и аргументы запуска nginx§pgrep -a nginx§Используй pgrep с -a.§pgrep -a показывает PID и командную строку.
03§Открой монитор процессов в реальном времени§top§Команда top.§top обновляет CPU и RAM для процессов.
04§Покажи свободную память в читаемом виде§free -h§free + human.§Поле available важнее «free» для оценки свободной памяти.
05§Покажи среднюю нагрузку сервера§uptime§uptime печатает load average.§Load average включает ожидающие CPU и непрерываемый I/O процессы.
06§Покажи пять замеров vmstat с интервалом 1 секунда§vmstat 1 5§У vmstat сначала интервал, потом число замеров.§wa — wait I/O, si/so — swap in/out.
07§Отправь процессу 1234 сигнал SIGTERM§kill -TERM 1234‖kill -15 1234§Не используй -9 без необходимости.§TERM позволяет процессу корректно завершиться.
08§Проверь, кто использует порт 8080§sudo lsof -i :8080‖lsof -i :8080‖sudo ss -lntp '( sport = :8080 )'§Подойдёт lsof -i :PORT.§lsof связывает порт с процессом.
09§Посмотри пределы ресурсов текущей оболочки§ulimit -a§Используй ulimit.§ulimit включает ограничение открытых файлов и процессов.
10§Покажи топ процессов по CPU§ps aux --sort=-%cpu§ps можно отсортировать по %cpu.§Отрицательный знак задаёт убывание.
11§Проверь работу процесса с PID 1234§ps -p 1234 -f§ps умеет фильтровать PID.§Флаг -p задаёт PID, -f — полные сведения.
`, 'activity'),
mk('systemd','systemd и журналы','СЕРВИСЫ',2,'Ключевой навык администратора: состояние, логи, проверки конфигурации, перезапуск.',[
  ['Проверка состояния','systemctl status показывает unit и последние сообщения. is-active возвращает лаконичное состояние. list-units --failed показывает неработающие юниты.','systemctl status nginx\nsystemctl --failed'],
  ['Журнал','journalctl -u фильтрует по юниту, -n ограничивает строки, -f следит за новыми, -b — только текущая загрузка. Обычно сначала читаем журнал, потом меняем сервис.','journalctl -u nginx -n 50 --no-pager\njournalctl -u nginx -f'],
  ['Управление','restart прерывает сервис, reload просит перечитать конфиг, enable включает автозапуск. daemon-reload нужен после правок unit-файлов, а не после каждого изменения nginx.conf.','sudo systemctl reload nginx\nsudo systemctl enable nginx']
],`
01§Проверь статус сервиса nginx§systemctl status nginx§systemctl + status + имя.§Это первая безопасная команда при инциденте с сервисом.
02§Покажи 50 последних строк журнала nginx§journalctl -u nginx -n 50§journalctl -u ... -n ...§-u ограничивает юнит, -n — число строк.
03§Следи за журналом nginx в реальном времени§journalctl -u nginx -f§journalctl и follow.§-f полезен во время воспроизведения ошибки.
04§Проверь, активен ли docker§systemctl is-active docker§Здесь нужен is-active.§is-active удобен для скриптов и быстрых проверок.
05§Покажи сервисы в failed-состоянии§systemctl --failed‖systemctl list-units --failed§У systemctl есть флаг --failed.§Список упавших юнитов помогает быстро сузить область.
06§Проверь, включён ли автозапуск nginx§systemctl is-enabled nginx§status и is-enabled отвечают на разные вопросы.§enabled не означает currently running.
07§Перезапусти nginx§sudo systemctl restart nginx§Для изменения состояния нужен sudo.§restart вызывает короткий простой; сначала проверь конфигурацию.
08§Перечитай конфигурацию nginx без полного рестарта§sudo systemctl reload nginx§Не restart, а reload.§reload обычно сохраняет текущие соединения, но зависит от юнита.
09§Покажи ошибки текущей загрузки§journalctl -b -p err§Флаги -b и -p err.§-b ограничивает текущую загрузку, priority err фильтрует по тяжести.
10§Перечитай unit-файлы systemd после их изменения§sudo systemctl daemon-reload§Нужно daemon-reload.§Это не перезапуск службы — systemd перечитывает определения юнитов.
11§Покажи содержимое unit-файла nginx§systemctl cat nginx§У systemctl есть подкоманда cat.§cat показывает также drop-in overrides.
12§Покажи события nginx за последний час§journalctl -u nginx --since "1 hour ago"§Параметр --since.§У journalctl есть естественно-языковые относительные даты.
`, 'server'),
mk('network','Сеть, маршруты и DNS','СЕТЬ',2,'Диагностика интерфейсов, IP, маршрутизации, портов, DNS и HTTP.',[
  ['Слои сети','Начинай с ip -br a (адреса) и ip route (маршруты). Затем проверяй шлюз, внешний адрес, DNS и прикладной порт. ping не подтверждает работоспособность TCP-сервиса.','ip -br addr\nip route\nip route get 1.1.1.1'],
  ['Порты','ss -lntp показывает TCP LISTEN и процессы; nc -vz проверяет TCP connect. curl -I проверяет ответ HTTP(S). Отличай connection refused от timeout.','sudo ss -lntp\nnc -vz 10.0.0.10 443'],
  ['DNS','resolvectl status показывает DNS-настройки, resolvectl query — резолвинг. dig позволяет обращаться к конкретному DNS. Успешный ping по IP при неуспешном разрешении имени указывает на DNS.','resolvectl status\ndig example.com\ndig @1.1.1.1 example.com']
],`
01§Кратко покажи интерфейсы и IP-адреса§ip -br addr‖ip -br a§ip с ключом -br.§-br делает вывод компактнее.
02§Покажи таблицу маршрутизации IPv4§ip -4 route‖ip route§Нужна команда ip route.§Смотри default route и специфичные префиксы.
03§Узнай маршрут до 8.8.8.8§ip route get 8.8.8.8§Команда ip route get.§Покажет next-hop и исходный IP для выбранного адреса.
04§Покажи TCP-порты в состоянии LISTEN вместе с процессами§sudo ss -lntp‖ss -lntp‖sudo ss -tlnp‖ss -tlnp§ss + l n t p.§-l слушающие, -n цифровые адреса, -t TCP, -p процессы.
05§Проверь TCP-подключение к 10.10.20.15:5432§nc -vz 10.10.20.15 5432§netcat с -v -z.§nc -vz делает connect-проверку без передачи полезной нагрузки.
06§Проверь DNS-ответ для example.com§dig example.com‖resolvectl query example.com§dig или resolvectl query.§Имя может не разрешаться даже при исправной IP-связности.
07§Запроси DNS-запись example.com у сервера 1.1.1.1§dig @1.1.1.1 example.com§У dig явный DNS задаётся через @.§Помогает отделить проблему локального резолвера от удалённого.
08§Покажи конфигурацию DNS через systemd-resolved§resolvectl status§Команда resolvectl.§На Ubuntu с resolved DNS настраивается по интерфейсам.
09§Проверь HTTP-заголовки https://example.com§curl -I https://example.com§curl с флагом заголовков.§-I отправляет HEAD-запрос.
10§Проверь доступность шлюза 192.168.1.1 по ICMP§ping -c 4 192.168.1.1§ping и 4 пакета.§Не каждый узел отвечает на ICMP, поэтому это лишь часть диагностики.
11§Покажи сетевые интерфейсы с расширенной статистикой§ip -s link§Команда ip -s link.§Ошибки и дропы на интерфейсе часто важнее ping.
12§Покажи соседей ARP/ND§ip neigh§Команда ip neigh.§Состояния FAILED/INCOMPLETE помогают при проблемах L2.
13§Проверь трассировку до 1.1.1.1§tracepath 1.1.1.1‖traceroute 1.1.1.1§tracepath или traceroute.§Не все сети пропускают ICMP/UDP-probes.
14§Проверь TLS/HTTP и покажи подробные этапы соединения§curl -v https://example.com§curl с verbose.§-v показывает разрешение имени, TCP, TLS и HTTP.
15§Проверь наличие слушателя UDP на 514§sudo ss -lnup‖ss -lnup§ss + UDP + listen + processes.§В UDP нет состояния LISTEN в том же смысле, что у TCP, но ss показывает привязанные сокеты.
`, 'network'),
mk('ssh','SSH и удалённый доступ','СЕТЬ',2,'Отделяй сетевую недоступность от ошибок аутентификации и настройки sshd.',[
  ['Три класса ошибок','Timeout: пакет не доходит/фильтруется. Connection refused: на целевом адресе порт закрыт или его отвергают. Permission denied: TCP и SSH, вероятно, работают, ищи причину авторизации.','ssh -vvv ubuntu@10.0.0.10'],
  ['Проверка сервера','sshd -t валидирует конфигурацию. ss -lntp показывает слушателя. journalctl -u ssh — журнал сервера. На Ubuntu имя unit обычно ssh, а не sshd.','sudo sshd -t\nsystemctl status ssh'],
  ['Ключи','Приватный ключ должен оставаться приватным. Храни ~/.ssh с ограниченными правами. Для прод-сервера не отключай проверку host key ради удобства.','chmod 700 ~/.ssh\nchmod 600 ~/.ssh/id_ed25519']
],`
01§Подключись к 10.0.0.12 под пользователем ubuntu§ssh ubuntu@10.0.0.12§ssh user@host.§SSH устанавливает защищённую интерактивную сессию.
02§Подключись по SSH на порт 2222§ssh -p 2222 ubuntu@10.0.0.12§Флаг порта строчный -p.§У scp синтаксис -P, не перепутай.
03§Включи подробную отладку SSH-подключения§ssh -vvv ubuntu@10.0.0.12§Три флага v.§-vvv помогает локализовать остановку рукопожатия.
04§Проверь статус SSH-сервиса в Ubuntu§systemctl status ssh§На Ubuntu unit обычно ssh.§sshd — имя демона, ssh — типичное имя unit.
05§Покажи последние 100 строк журнала SSH-сервера§journalctl -u ssh -n 100§journalctl -u ssh.§Нужны ошибки доступа, bind, ключей и PAM.
06§Проверь конфигурацию sshd без рестарта§sudo sshd -t§Демон имеет флаг -t.§sshd -t проверяет синтаксис и корректность опций.
07§Покажи эффективную конфигурацию SSH-сервера§sudo sshd -T§Флаг прописная T.§Для Match-правил полезно дополнительно указать -C.
08§Установи права 700 на ~/.ssh§chmod 700 ~/.ssh§Каталогу нужно ограничить доступ.§При слишком открытых правах ssh может отвергнуть ключи.
09§Установи права 600 на приватный ключ§chmod 600 ~/.ssh/id_ed25519§rw только владельцу.§Не публикуй и не передавай приватный ключ.
10§Проверь доступность TCP-порта SSH на 10.0.0.12§nc -vz 10.0.0.12 22§Здесь нужен nc, не ping.§TCP connect не доказывает успешную SSH-аутентификацию.
`, 'key'),
mk('storage','Диски и файловые системы','РЕСУРСЫ',2,'Разбирай нехватку места, inode, загрузку диска и устройства.',[
  ['Место vs inode','df -h смотрит файловые системы, du -sh — размер конкретного каталога. df -i показывает inode; можно исчерпать inode при свободных гигабайтах.','df -h\ndf -i\ndu -sh /var/log'],
  ['Устройства и I/O','lsblk -f показывает разделы, типы FS и точки монтирования. iostat может выявить I/O bottleneck. Перед изменением разделов обязательно снимай контекст и проверяй бэкапы.','lsblk -f\nfindmnt /var/lib'],
  ['Особый случай','Если df видит занятое пространство, а du почти не видит — возможно, процесс держит удалённый открытый файл. Используй lsof +L1.','sudo lsof +L1']
],`
01§Покажи заполненность файловых систем§df -h§df с human readable.§df считает выделенные блоки по смонтированным FS.
02§Покажи расход inode§df -i§Ключ -i.§При 100% inode новые файлы не создаются, даже если есть место.
03§Покажи размер каталога /var/log одной строкой§du -sh /var/log§du с -s и -h.§-s — итог, -h — удобные единицы.
04§Покажи самые крупные каталоги первого уровня /var§sudo du -h --max-depth=1 /var§du с --max-depth=1.§Команда может быть тяжёлой на больших хранилищах.
05§Покажи блочные устройства и ФС§lsblk -f§lsblk с флагом -f.§UUID и FSTYPE пригодятся для fstab.
06§Покажи точки монтирования для /var/lib§findmnt -T /var/lib§findmnt -T путь.§-T находит ФС, содержащую указанный путь.
07§Покажи открытые удалённые файлы§sudo lsof +L1§Подсказка: lsof +L1.§Удалённые файлы могут продолжать занимать блоки до закрытия FD.
08§Покажи UUID блочных устройств§sudo blkid§Команда blkid.§Используй UUID вместо непостоянных /dev/sdX.
09§Покажи размеры дисковых разделов§lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINTS§Опция вывода -o.§Табличный вывод позволяет быстро сверить диски/монтирования.
10§Покажи свободное место в /tmp§df -h /tmp§df умеет принимать путь.§Особенно важно, если /tmp — отдельный tmpfs.
`, 'hard-drive'),
mk('packages','APT и обновления','СИСТЕМА',2,'Устанавливай и диагностируй пакеты без разрушительных команд.',[
  ['Проверки','apt update обновляет индексы, не сами пакеты. apt policy показывает версии и источники; dpkg -l — состояние установленных пакетов.','apt policy nginx\ndpkg -l | grep nginx'],
  ['Установка','apt install меняет систему; для расследования сначала apt-cache show или apt policy. Если пакет «не найден», проверь apt sources и обновление индексов.','sudo apt update\nsudo apt install nginx'],
  ['Осторожность','Не удаляй lock-файлы apt или dpkg наугад: сначала проверь, какой процесс держит блокировку. Две установки одновременно не должны работать.','ps aux | grep -E "apt|dpkg"']
],`
01§Обнови индекс пакетов§sudo apt update§Это update, не upgrade.§Обновляет метаданные репозиториев.
02§Установи пакет nginx§sudo apt install nginx§apt install.§Изменяет систему; сначала убедись в источнике пакета.
03§Покажи установленные и доступные версии nginx§apt policy nginx‖apt-cache policy nginx§Команда apt policy.§Candidate — версия, которую можно установить.
04§Проверь, установлен ли nginx через dpkg§dpkg -l nginx§dpkg с флагом -l.§Статус ii означает установленный пакет.
05§Найди пакеты по слову nginx§apt search nginx§apt умеет искать пакеты.§Поиск зависит от актуальности индексов.
06§Покажи информацию о пакете curl§apt show curl‖apt-cache show curl§apt show.§Содержит описание, зависимости и версии.
07§Покажи историю apt§cat /var/log/apt/history.log‖less /var/log/apt/history.log§Смотреть файл history.log.§Помогает восстановить порядок изменений пакетов.
08§Проверь, какие пакеты можно обновить§apt list --upgradable§apt list с --upgradable.§Прежде чем обновлять, оцените влияние на прод.
09§Проверь целостность зависимостей dpkg§sudo dpkg --audit§Команда dpkg --audit.§Показывает частично установленные/неправильно настроенные пакеты.
`, 'package'),
mk('nginx','Nginx и HTTP','ВЕБ',3,'Настройка, проверка конфигурации, reverse proxy, 502 и 404.',[
  ['Контур запроса','Клиент → DNS → TLS/TCP → Nginx → upstream-приложение. HTTP 502 означает, что прокси не получил корректный ответ от upstream, но не доказывает конкретную причину.','curl -I https://example.com\nsudo ss -lntp'],
  ['Проверяй до рестарта','nginx -t проверяет синтаксис; nginx -T выводит итоговую конфигурацию. Следом проверь error.log и upstream-порт.','sudo nginx -t\nsudo nginx -T'],
  ['Логи и проверки','access.log отражает запросы, error.log — ошибки nginx. curl -H Host помогает тестировать виртуальный хост без изменения DNS.','tail -n 50 /var/log/nginx/error.log\ncurl -I -H "Host: example.com" http://127.0.0.1']
],`
01§Проверь синтаксис конфигурации Nginx§sudo nginx -t§nginx -t.§Прежде чем reload/restart — проверка конфигурации.
02§Выведи полную итоговую конфигурацию Nginx§sudo nginx -T§Флаг -T прописной.§Включает содержимое include-файлов.
03§Покажи последние 100 строк error.log§tail -n 100 /var/log/nginx/error.log§tail -n.§Ошибки upstream обычно видны в error.log.
04§Следи за access.log в реальном времени§tail -f /var/log/nginx/access.log§tail -f.§Используй для проверки входящих запросов.
05§Проверь заголовки локального веб-сервера§curl -I http://127.0.0.1§curl -I.§Если локально работает, но снаружи нет — ищи сеть, firewall и TLS.
06§Проверь заголовки локального сайта с Host example.com§curl -I -H "Host: example.com" http://127.0.0.1§curl -H задаёт заголовок Host.§Проверка нужного server_name без правки DNS.
07§Применить изменённую конфигурацию Nginx без полного рестарта§sudo systemctl reload nginx§Подойдёт reload.§Проверяй nginx -t заранее.
08§Проверь, кто слушает TCP-порт 80§sudo ss -lntp '( sport = :80 )'‖sudo lsof -i :80§ss либо lsof.§Проверка слушателя отделяет отказ bind от недоступности маршрута.
09§Проверь доступность upstream на localhost:3000§nc -vz 127.0.0.1 3000§Тест TCP через nc.§502 часто связано с недоступным upstream.
10§Проверь логи Nginx через systemd§journalctl -u nginx -n 50§journalctl с -u и -n.§Journal и /var/log/nginx — разные источники полезной информации.
`, 'globe'),
mk('docker','Docker и контейнеры','КОНТЕЙНЕРЫ',3,'Состояние, логи, сети и ресурсы контейнеров.',[
  ['Статус и жизненный цикл','docker ps показывает работающие контейнеры, -a — все. exit code и restart count часто объясняют, почему сервис исчез.','docker ps -a\ndocker inspect web'],
  ['Логи и выполнение','docker logs работает по имени/ID контейнера. docker exec запускает команду внутри работающего контейнера; для остановленного контейнера он не подходит.','docker logs --tail 100 web\ndocker exec -it web sh'],
  ['Ресурсы','docker stats показывает CPU/RAM, docker inspect — подробную конфигурацию и healthcheck. Избегай docker system prune на чужом проде без оценки последствий.','docker stats --no-stream\ndocker inspect web']
],`
01§Покажи все контейнеры, включая остановленные§docker ps -a§docker ps с -a.§Часто причина инцидента видна в статусе Exited.
02§Покажи только запущенные контейнеры§docker ps§Без -a.§docker ps по умолчанию показывает running.
03§Покажи последние 100 строк логов контейнера web§docker logs --tail 100 web§docker logs с --tail.§Прямой способ увидеть stacktrace контейнера.
04§Следи за логами контейнера web§docker logs -f web§docker logs follow.§Вывод прекращается Ctrl+C; контейнер не останавливается.
05§Покажи подробные параметры контейнера web§docker inspect web§docker inspect.§Ищи State, Mounts, NetworkSettings, Health.
06§Зайди в работающий контейнер web через sh§docker exec -it web sh‖docker exec -ti web sh‖docker exec -i -t web sh§docker exec -it + имя + shell.§Не во всех образах есть bash; sh доступен чаще.
07§Покажи список образов Docker§docker images§docker images.§Проверка версий образов помогает выявить откат/обновление.
08§Покажи сети Docker§docker network ls§docker network ls.§Контейнеры в разных сетях могут не видеть друг друга.
09§Покажи текущую нагрузку контейнеров один раз§docker stats --no-stream§Параметр --no-stream.§Увидишь CPU, память, net I/O.
10§Проверь состояние службы Docker§systemctl status docker§Docker daemon — служба.§При недоступном сокете начни с systemctl.
`, 'boxes'),
mk('security','Firewall и безопасность','ПРОДВИНУТЫЙ',3,'Базовые проверки UFW/nftables и безопасное управление правилами.',[
  ['Слои фильтрации','Локальный firewall — только один из вариантов. Правила могут быть и на маршрутизаторе, и в облаке. Проверяй путь пакета, слушателя и фильтры отдельно.','sudo ufw status verbose\nsudo nft list ruleset'],
  ['Приоритет безопасности','Изменения в firewall по SSH могут отрезать твой доступ. Сначала проверь текущие правила и откатный путь. Не делай ufw reset без проверки.','sudo ufw status numbered'],
  ['Доступ','Журналы аутентификации, sudo и SSH дают аудиторский контекст. Не вставляй секреты в общие логи и тренажёры.','journalctl -u ssh -n 100']
],`
01§Покажи расширенный статус UFW§sudo ufw status verbose§ufw status verbose.§Показывает policy и правила UFW.
02§Покажи правила UFW с номерами§sudo ufw status numbered§status numbered.§Номера удобны для адресного удаления правил.
03§Покажи правила nftables§sudo nft list ruleset§nft list ruleset.§Современный Ubuntu может использовать nftables под капотом.
04§Покажи последние события SSH-сервера§journalctl -u ssh -n 100§Проверяй unit ssh.§Частые Authentication failure могут говорить о переборе.
05§Покажи попытки входа пользователей§last -a§Команда last.§Смотрит записи wtmp; аудит зависит от наличия записей.
06§Покажи предыдущие неудачные входы§sudo lastb§Команда lastb.§На некоторых системах записи btmp могут быть отключены.
07§Проверь состояние AppArmor§sudo aa-status§Утилита aa-status.§AppArmor может запрещать доступ даже при корректных UNIX-правах.
08§Покажи, кто входит в группу sudo§getent group sudo§getent group sudo.§Это список членов группы; права могут также задаваться sudoers.
09§Проверь правила sudo без редактирования§sudo -l§sudo -l.§Показывает доступные текущему пользователю команды sudo.
`, 'lock'),
mk('shell','Shell и автоматизация','ПРОДВИНУТЫЙ',3,'Перенаправления, пайпы, cron и основы безопасных bash-скриптов.',[
  ['Потоки','stdout (1), stderr (2), stdin (0). > перезаписывает файл, >> добавляет, 2> перенаправляет ошибки. Ошибки в конвейере могут быть скрыты без pipefail.','command > output.log 2> errors.log\nset -o pipefail'],
  ['Повторяемость','Параметры скрипта, проверка exit status и кавычки защищают от многих ошибок. В bash заключай переменные-пути в двойные кавычки.','echo "$HOME"\necho $?' ],
  ['Планировщик','crontab -l показывает задания пользователя. В Linux важно отличать пользовательский crontab, /etc/crontab и systemd timers.','crontab -l\nsystemctl list-timers --all']
],`
01§Покажи код завершения последней команды§echo $?§Специальная переменная $.§0 обычно означает успех, ненулевой код — ошибку.
02§Добавь вывод команды date в конец times.log§date >> times.log§Используй двойное больше.§>> добавляет; > перезапишет файл.
03§Перенаправь ошибки команды ls /missing в errors.log§ls /missing 2> errors.log§stderr — дескриптор 2.§2> перенаправляет только stderr.
04§Покажи переменную PATH§echo "$PATH"‖echo $PATH§echo переменная с долларом.§PATH — список директорий поиска исполняемых файлов.
05§Покажи пользовательские задания cron§crontab -l§crontab с -l.§Работает для текущего пользователя.
06§Покажи все systemd timers§systemctl list-timers --all§systemctl list-timers.§Timers — альтернатива cron с учётом systemd.
07§Запусти файл script.sh через bash§bash script.sh§bash + файл.§Не нужно делать executable при явном запуске через bash.
08§Проверь синтаксис bash-скрипта script.sh§bash -n script.sh§bash -n не исполняет скрипт.§Флаг -n читает команды без выполнения.
09§Включи трассировку исполнения bash-скрипта script.sh§bash -x script.sh§bash -x.§Внимание: трассировка может вывести секреты.
10§Выведи отсортированные уникальные строки файла names.txt§sort names.txt | uniq§Нужны sort и uniq через pipe.§uniq убирает только соседние повторы.
`, 'terminal'),
mk('observability','Продвинутая диагностика','ЭКСПЕРТ',4,'Свяжи симптомы с первопричиной: dmesg, сокеты, ошибки, сеть и производительность.',[
  ['Узкие места','CPU, RAM, диск, сеть и приложение — разные причины медленной работы. Сначала собери временную линию: когда началось и что изменилось.','uptime\nvmstat 1 5\njournalctl -p err -b'],
  ['Ядро и OOM','dmesg и journalctl -k показывают сообщения ядра. Если Linux OOM-killer убил процесс, это часто видно в kernel journal.','journalctl -k -b | grep -i oom'],
  ['Проверки без изменения','ss, ip, curl, dig, df, ps и journalctl читают состояние и обычно безопасны для начала. Изменения, особенно в продакшене, стоит отделять от диагностики.','ss -s\nip -s link\nsystemctl --failed']
],`
01§Покажи ошибки текущей загрузки из журнала§journalctl -b -p err§-b и -p err.§Важен временной контекст.
02§Покажи сообщения ядра текущей загрузки§journalctl -k -b§journalctl -k -b.§Ядро сообщает о драйверах, устройствах, OOM и FS.
03§Найди OOM-события в журнале ядра§journalctl -k -b | grep -i oom§journalctl -k плюс grep.§Проверка гипотезы об убийстве процесса OOM-killer.
04§Покажи сводную статистику сокетов§ss -s§ss -s.§Количество соединений и состояния помогают оценить насыщение.
05§Покажи список процессов по потреблению памяти§ps aux --sort=-%mem§ps с сортировкой по памяти.§RSS и %MEM — разные метрики, смотрите оба.
06§Покажи статистику ошибок сетевых интерфейсов§ip -s link§ip -s link.§Drops/errors могут объяснить потери пакетов.
07§Проверь, какие сервисы упали§systemctl --failed§Список failed-юнитов.§Не все ошибки приложения приводят к failed-состоянию.
08§Покажи активные TCP-соединения§ss -nt§ss с -n и -t.§Полезно для установленных соединений и их состояния.
09§Проверь используемое ядро Linux§uname -r§uname с -r.§Версия ядра нужна для анализа драйверов и регрессий.
10§Проверь время работы системы§uptime -p§uptime с -p.§Помогает сопоставить инцидент с последней перезагрузкой.
11§Покажи системный журнал с момента 2026-11-18 10:00§journalctl --since "2026-11-18 10:00"§Используй --since и дату.§Временной диапазон — фундамент корреляции событий.
`, 'pulse')
];

const step = (goal, patterns, output, learning, hint) => ({goal, patterns, output, learning, hint});
const S = (id, title, level, category, summary, symptoms, rootCause, steps, debrief, icon) => ({id,title,level,category,summary,symptoms,rootCause,steps,debrief,icon});
const incidents = [
S('nginx-down','Nginx не запускается',1,'systemd / Nginx','После изменения конфигурации сайт не отвечает.', ['HTTP: connection refused','Мониторинг: nginx inactive (failed)'], 'Ошибка синтаксиса в конфиге: listen 80888', [
 step('Проверь состояние nginx',['^systemctl\\s+status\\s+nginx'], '● nginx.service - A high performance web server\n   Active: failed (Result: exit-code)\n   ExecStartPre=/usr/sbin/nginx -t (code=exited, status=1/FAILURE)', 'Сервис не стартует из-за неудачной предварительной проверки.', 'systemctl status nginx'),
 step('Изучи журнал службы',['^journalctl\\s+.*-u\\s+nginx|^journalctl\\s+.*--unit[= ]nginx'], 'nginx: [emerg] invalid port in "listen 80888" in /etc/nginx/sites-enabled/default:5', 'Ошибка локализована: конфигурационный файл и строка.', 'journalctl -u nginx -n 50'),
 step('Проверь синтаксис Nginx',['^(sudo\\s+)?nginx\\s+-t'], 'nginx: [emerg] invalid port in "listen 80888" in /etc/nginx/sites-enabled/default:5\nnginx: configuration file /etc/nginx/nginx.conf test failed', 'Проверка конфигурации безопаснее произвольных рестартов.', 'sudo nginx -t'),
 step('Открой проблемный конфиг и исправь опечатку',['^(sudoedit|sudo\\s+(nano|vim|vi))\\s+/etc/nginx/sites-enabled/default'], 'Редактор (симуляция): listen 80888; → listen 80;\nИзменения сохранены. Синтаксис исправлен.', 'Теперь можно применить проверенную конфигурацию.', 'sudoedit /etc/nginx/sites-enabled/default'),
 step('Запусти службу',['^sudo\\s+systemctl\\s+(restart|start)\\s+nginx'], '● nginx.service - Active: active (running)\nHTTP/1.1 200 OK', 'Сервис восстановлен.', 'sudo systemctl restart nginx')
], 'Три опорные проверки: status → журнал → nginx -t. Не рестартуй бесконечно сервис с битым конфигом.', 'server'),
S('no-dns','IP доступен, домен не открывается',1,'Сеть / DNS','Сервер ходит по IP, но curl по имени выдаёт ошибку.', ['ping 1.1.1.1 успешен','curl: (6) Could not resolve host'], 'В resolved указан недоступный DNS 10.20.0.53', [
 step('Покажи адреса и маршруты',['^ip\\s+(-br\\s+)?(addr|a|route)|^ip\\s+-4\\s+route'], 'ens3 UP 10.20.0.25/24\ndefault via 10.20.0.1 dev ens3', 'L3-конфигурация на месте.', 'ip -br addr'),
 step('Проверь, может ли резолвер разрешить имя',['^(dig|resolvectl\\s+query|nslookup)\\s+example\\.com'], ';; communications error to 10.20.0.53#53: timed out\n;; no servers could be reached', 'DNS-запрос не получает ответа.', 'dig example.com'),
 step('Посмотри конфигурацию DNS',['^resolvectl\\s+status|^cat\\s+/etc/resolv\\.conf'], 'Link 2 (ens3)\n  Current DNS Server: 10.20.0.53\n  DNS Servers: 10.20.0.53', 'Нужна проверка доступности конкретного DNS.', 'resolvectl status'),
 step('Проверь доступность DNS-сервера по TCP/53',['^nc\\s+-vz\\s+10\\.20\\.0\\.53\\s+53'], 'nc: connect to 10.20.0.53 port 53 (tcp) timed out', 'Неисправность DNS-пути подтверждена для TCP; UDP/53 нужно проверять отдельно.', 'nc -vz 10.20.0.53 53')
], 'В реальной сети выясни, почему DNS недоступен (маршрут, ACL, сам DNS), вместо бессистемной замены на публичный.', 'network'),
S('disk-full','Диск заполнен на 100%',1,'Хранилище','Приложение перестало писать логи и создавать файлы.', ['No space left on device','/var недоступен для записи'], 'В /var/log накопился большой старый application.log', [
 step('Проверь свободное место',['^df\\s+(-h|--human-readable)'], 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda1        40G   40G     0 100% /', 'Проблема подтверждена на файловой системе.', 'df -h'),
 step('Локализуй большой каталог',['^(sudo\\s+)?du\\s+.*(/var|/var/log)'], '36G  /var\n33G  /var/log\n2.1G /var/lib', 'Источник роста находится в логах.', 'sudo du -h --max-depth=1 /var'),
 step('Проверь конкретные логи',['^(sudo\\s+)?(ls\\s+.*?/var/log|du\\s+.*?/var/log)'], '-rw-r----- 1 app adm 31G application.log\n-rw-r----- 1 app adm 14M syslog', 'Выявлен файл-кандидат; в реальности сначала настрой logrotate/retention.', 'ls -lh /var/log'),
 step('Проверь удалённые открытые файлы',['^(sudo\\s+)?lsof\\s+\\+L1'], 'No open deleted files found', 'Освобождение места безопаснее планировать с владельцем сервиса, не удаляя логи вслепую.', 'sudo lsof +L1')
], 'Не начинай с rm -rf /var/log. Ищи причину роста и настрой ротацию, чтобы инцидент не повторился.', 'hard-drive'),
S('ssh-refused','SSH: Connection refused',1,'SSH / Сеть','До хоста пингуется, SSH не подключается.', ['ssh: connect to host 10.0.0.8 port 22: Connection refused'], 'На сервере ssh.service остановлен', [
 step('Проверь TCP-порт',['^nc\\s+-vz\\s+10\\.0\\.0\\.8\\s+22'], 'nc: connect to 10.0.0.8 port 22 (tcp) failed: Connection refused', 'До хоста есть TCP-ответ, но слушатель отсутствует или порт отклоняется.', 'nc -vz 10.0.0.8 22'),
 step('На консоли сервера проверь SSH unit',['^systemctl\\s+status\\s+ssh'], '● ssh.service - OpenBSD Secure Shell server\n   Active: inactive (dead)', 'Вероятная причина найдена.', 'systemctl status ssh'),
 step('Проверь конфигурацию до запуска',['^(sudo\\s+)?sshd\\s+-t'], '(no output, exit 0)', 'Конфигурация синтаксически корректна.', 'sudo sshd -t'),
 step('Запусти SSH',['^sudo\\s+systemctl\\s+start\\s+ssh'], '● ssh.service - Active: active (running)\nServer listening on 0.0.0.0 port 22.', 'Доступ восстановлен, проверь автозапуск и причину остановки.', 'sudo systemctl start ssh')
], 'Сначала разделяй IP-доступность, TCP-соединение и SSH-аутентификацию.', 'key'),
S('high-cpu','CPU 100%, жалобы на тормоза',2,'Процессы','Сервер резко стал отвечать медленно.', ['load average: 18.3','CPU utilization > 95%'], 'Отладочный python-процесс бесконечно считает в цикле', [
 step('Посмотри общую нагрузку',['^uptime|^top'], 'load average: 18.3, 17.6, 15.1\n%Cpu(s): 97 us, 1 sy, 2 id', 'CPU, а не I/O, используется почти полностью.', 'uptime'),
 step('Найди потребителя CPU',['^ps\\s+.*--sort=-%cpu|^top|^pidstat'], 'USER PID %CPU COMMAND\napp  824  388.2 python3 /opt/app/debug-worker.py\nroot 1 0.1 systemd', 'Процесс потребляет более 3 ядер.', 'ps aux --sort=-%cpu'),
 step('Посмотри подробную информацию о PID',['^ps\\s+.*-p\\s+824|^cat\\s+/proc/824/cmdline'], 'PID 824  python3 /opt/app/debug-worker.py\nStarted 12 minutes ago', 'Подтверждён конкретный debug-worker.', 'ps -p 824 -f'),
 step('Попробуй мягко завершить явно ошибочный процесс',['^sudo\\s+kill\\s+(-TERM|-15)?\\s*824|^kill\\s+(-TERM|-15)?\\s*824'], 'PID 824 terminated gracefully\nload average: 2.1', 'SIGTERM предпочтительнее SIGKILL без необходимости.', 'sudo kill -TERM 824')
], 'Перед завершением процесса выясни владельца и влияние на данные: на реальном проде согласуй действие.', 'activity'),
S('http-502','Nginx отвечает 502 Bad Gateway',2,'Веб / Proxy','Публичный адрес жив, но пользователи получают 502.', ['Nginx: 502 Bad Gateway','После релиза API не отвечает'], 'Приложение слушает 3001, а proxy_pass настроен на 3000', [
 step('Проверь ответ Nginx',['^curl\\s+.*(127\\.0\\.0\\.1|example\\.com)'], 'HTTP/1.1 502 Bad Gateway\nServer: nginx', 'Прокси отвечает, теперь проверяем upstream.', 'curl -I http://127.0.0.1'),
 step('Прочитай error.log Nginx',['^(sudo\\s+)?(tail|less|cat|grep)\\s+.*?/var/log/nginx/error\\.log'], 'connect() failed (111: Connection refused) while connecting to upstream, upstream: "http://127.0.0.1:3000/"', 'Порт 3000 отказывается принимать соединение.', 'tail -n 50 /var/log/nginx/error.log'),
 step('Покажи слушающие TCP-порты',['^(sudo\\s+)?ss\\s+-[a-z]*l[a-z]*t|^(sudo\\s+)?lsof\\s+.*:300'], 'LISTEN 0 511 0.0.0.0:80 nginx\nLISTEN 0 128 127.0.0.1:3001 node', 'Upstream слушает 3001, не 3000.', 'sudo ss -lntp'),
 step('Проверь конфигурацию nginx',['^(sudo\\s+)?nginx\\s+-T|^(sudo\\s+)?grep\\s+.*proxy_pass'], 'location /api/ { proxy_pass http://127.0.0.1:3000; }', 'Найдена несовместимость портов.', 'sudo nginx -T'),
 step('Открой конфиг upstream для исправления',['^sudoedit\\s+/etc/nginx/sites-enabled/api|^sudo\\s+(vim|nano|vi)\\s+/etc/nginx/sites-enabled/api'], 'proxy_pass http://127.0.0.1:3001;\nИзменение сохранено (симуляция). Проверка и reload остаются задачей при реальном инциденте.', 'Конфигурация исправлена; в реальности нужно nginx -t и reload.', 'sudoedit /etc/nginx/sites-enabled/api')
], '502 — симптом между прокси и upstream. Логи nginx и ss дают точные факты.', 'globe'),
S('no-default-route','После ребута нет интернета',2,'Сеть / Маршруты','Внутренняя сеть работает, внешний IP недоступен.', ['ssh внутри VLAN работает','ping 1.1.1.1: Network is unreachable'], 'Не загружен маршрут по умолчанию', [
 step('Покажи адреса интерфейсов',['^ip\\s+(-br\\s+)?(a|addr)'], 'ens3 UP 172.19.10.25/24', 'IP-интерфейс настроен.', 'ip -br addr'),
 step('Посмотри таблицу маршрутов',['^ip\\s+(-4\\s+)?route'], '172.19.10.0/24 dev ens3 proto kernel scope link src 172.19.10.25\n# default route отсутствует', 'Нет маршрута для внешних сетей.', 'ip route'),
 step('Проверь маршрут до внешнего IP',['^ip\\s+route\\s+get\\s+1\\.1\\.1\\.1'], 'RTNETLINK answers: Network is unreachable', 'Гипотеза подтверждена.', 'ip route get 1.1.1.1'),
 step('Проверь конфигурацию netplan (без применения)',['^(sudo\\s+)?(cat|ls|grep)\\s+.*?/etc/netplan'], 'network:\n  ethernets:\n    ens3:\n      addresses: [172.19.10.25/24]\n      # routes: отсутствуют', 'Нужно восстановить default via по документации сети и применить через контролируемый rollback.', 'ls -l /etc/netplan')
], 'Не добавляй default route наугад, пока не известен шлюз. Удалённые изменения сети требуют rollback.', 'network'),
S('permission-denied','Permission denied у веб-приложения',2,'Права / FS','Сервис web не может открыть конфигурацию.', ['EACCES: permission denied, /srv/app/config.yml'], 'У /srv/app неверные права каталога: нет x для пользователя сервиса', [
 step('Посмотри владельца и права файла',['^ls\\s+-l\\s+/srv/app/config\\.yml'], '-rw-r----- 1 www-data www-data 1230 config.yml', 'На самом файле права выглядят корректно.', 'ls -l /srv/app/config.yml'),
 step('Проверь права всех уровней пути',['^namei\\s+-l\\s+/srv/app/config\\.yml'], 'f: /srv/app/config.yml\n drwxr-xr-x root root /\n drwxr-xr-x root root srv\n drwx------ root root app\n -rw-r----- www-data www-data config.yml', 'Владелец www-data не может пройти каталог /srv/app.', 'namei -l /srv/app/config.yml'),
 step('Проверь пользователя процесса',['^ps\\s+.*(web|node)|^id\\s+www-data'], 'uid=33(www-data) gid=33(www-data) groups=33(www-data)', 'Проверен сервисный пользователь.', 'id www-data'),
 step('Назначь группу www-data каталогу /srv/app',['^sudo\\s+chgrp\\s+www-data\\s+/srv/app'], 'drwx------ root www-data /srv/app\nВладелец и группа скорректированы, но прав x для группы пока нет.', 'Сначала сменили группу; теперь нужно разрешить ей проход.', 'sudo chgrp www-data /srv/app'),
 step('Разреши группе проход через каталог /srv/app',['^sudo\\s+chmod\\s+750\\s+/srv/app'], 'drwxr-x--- root www-data /srv/app\nДоступ к файлу восстановлен.', 'Обе необходимые операции выполнены. 777 не потребовалось.', 'sudo chmod 750 /srv/app')
], 'Восстанови доступ двумя адресными действиями: chgrp для нужной группы, затем chmod для x-бита на каталоге.', 'shield'),
S('docker-crash','Контейнер постоянно перезапускается',2,'Docker','API недоступен, контейнер исчезает из docker ps.', ['Restarting (1) every 10 seconds','HTTP 503'], 'Отсутствует обязательная переменная DATABASE_URL', [
 step('Проверь все контейнеры',['^docker\\s+ps\\s+-a'], 'api  Restarting (1)  3 seconds ago\ndb   Up 2 hours', 'Контейнер не имеет состояния running достаточно долго.', 'docker ps -a'),
 step('Прочитай логи api',['^docker\\s+logs\\s+.*api'], 'FATAL: DATABASE_URL environment variable is required\nProcess exited with code 1', 'Логи дают непосредственную причину.', 'docker logs --tail 100 api'),
 step('Посмотри состояние и конфигурацию',['^docker\\s+inspect\\s+api'], '"State": {"Restarting":true,"ExitCode":1}\n"Env": ["NODE_ENV=production"]', 'Отсутствующая переменная подтверждена. Не печатай реальные секреты в общие чаты.', 'docker inspect api'),
 step('Проверь docker compose конфигурацию',['^docker\\s+compose\\s+config'], 'services:\n  api:\n    environment:\n      NODE_ENV: production\n      # DATABASE_URL отсутствует', 'Исправлять необходимо конфигурацию деплоя или секреты, затем redeploy.', 'docker compose config')
], 'Проверь environment и источник секрета. На проде не вводи секреты вручную в логи или терминал записи.', 'boxes'),
S('apt-locked','apt сообщает Could not get lock',2,'APT','Автоматизация обновления столкнулась с блокировкой apt.', ['Could not get lock /var/lib/dpkg/lock-frontend'], 'В фоновом режиме идёт unattended-upgrades', [
 step('Посмотри процессы apt/dpkg',['^ps\\s+.*|^pgrep\\s+.*(apt|dpkg|unattended)'], 'root 1822 /usr/bin/unattended-upgrade\nroot 1880 /usr/bin/dpkg --status-fd 23', 'Блокировка имеет активного владельца.', 'ps aux'),
 step('Проверь unattended-upgrades',['^systemctl\\s+status\\s+unattended-upgrades|^journalctl\\s+.*-u\\s+unattended-upgrades'], '● unattended-upgrades.service\n Active: active (running)\nCurrently upgrading linux-image-generic', 'Процесс выполняет реальные обновления.', 'systemctl status unattended-upgrades'),
 step('Посмотри свежие записи apt',['^(sudo\\s+)?(tail|cat|less)\\s+.*?/var/log/apt'], 'Upgrade: linux-image-generic\nSetting up linux-image-6.x...\nProcessing triggers...', 'Обновление ещё идёт. Безопасное решение — дождаться его завершения и повторить.', 'tail -n 30 /var/log/apt/term.log')
], 'Не удаляй lock-файл, пока dpkg активен: можно повредить состояние пакетов.', 'package'),
S('memory-oom','Сервис пропал из-за OOM',3,'Память / Ядро','Приложение внезапно завершилось без stacktrace.', ['OOMKilled в мониторинге','Не хватает памяти после нагрузки'], 'Процесс превысил доступную RAM; его завершил OOM-killer', [
 step('Посмотри оперативную память',['^free\\s+-h'], 'Mem: total 8.0Gi used 7.6Gi available 180Mi\nSwap: 0B', 'Свободной доступной памяти почти нет.', 'free -h'),
 step('Проверь kernel journal на OOM',['^journalctl\\s+.*-k.*|^dmesg'], 'kernel: Out of memory: Killed process 2830 (java) total-vm:13800000kB anon-rss:6200000kB', 'OOM-killer завершил java.', 'journalctl -k -b'),
 step('Посмотри потребителей памяти',['^ps\\s+.*--sort=-%mem|^top'], 'USER PID %MEM RSS COMMAND\napp 2830  76.1 6.1G java -jar api.jar', 'Сопоставь объём памяти с лимитами процесса/контейнера.', 'ps aux --sort=-%mem'),
 step('Посмотри ограничения процесса/сервиса',['^systemctl\\s+show\\s+.*api|^systemctl\\s+cat\\s+api'], 'MemoryMax=0\nExecStart=/usr/bin/java -Xmx7g -jar /srv/api.jar', 'JVM heap почти равен RAM узла: нужно пересмотреть Xmx и резерв ОС.', 'systemctl show api -p MemoryMax')
], 'Restart восстановит доступность лишь временно. Устрани утечку/лимиты или скорректируй ёмкость.', 'activity'),
S('inode-full','Место есть, но файлы не создаются',3,'Файловые системы','df -h показывает свободные гигабайты, приложение говорит ENOSPC.', ['No space left on device','df -h: свободно 24G'], 'Закончились inode из-за миллионов маленьких файлов', [
 step('Проверь блоки на файловой системе',['^df\\s+-h'], 'Filesystem Size Used Avail Use%\n/dev/vdb1 50G 26G 24G 52%', 'По блокам место ещё есть.', 'df -h'),
 step('Проверь inode',['^df\\s+-i'], 'Filesystem Inodes IUsed IFree IUse%\n/dev/vdb1 3.2M 3.2M 0 100%', 'Причина нехватки места — inode.', 'df -i'),
 step('Найди каталог с множеством объектов',['^(sudo\\s+)?find\\s+/var|^(sudo\\s+)?du\\s+.*--inodes'], '/var/cache/app/sessions: 3,100,000 tiny files', 'Нужна проверка политики очистки кеша/сессий.', 'sudo du --inodes -d 2 /var')
], 'На нагруженном сервере полный find по дереву может создавать дополнительную нагрузку. Проверяй локально и ограничивай область.', 'hard-drive'),
S('tls-expired','TLS-сертификат истёк',3,'TLS / Nginx','Сайт открывается с предупреждением о безопасности.', ['curl: (60) SSL certificate problem','Браузер: certificate expired'], 'Сертификат на фронтенде просрочен; обновление автоматизации не сработало', [
 step('Посмотри подробный TLS-ответ',['^curl\\s+-v\\s+https://'], '* SSL certificate problem: certificate has expired\n* Server certificate: subject=CN=app.example.com', 'TLS-проверка не проходит.', 'curl -v https://app.example.com'),
 step('Посмотри даты удалённого сертификата',['^openssl\\s+s_client\\s+.*'], 'notBefore=Oct 01 00:00:00 2026 GMT\nnotAfter=Nov 01 23:59:59 2026 GMT\nverify error:num=10:certificate has expired', 'Срок истёк, не нужно отключать проверку TLS.', 'openssl s_client -connect app.example.com:443 -servername app.example.com'),
 step('Проверь таймер обновления сертификата',['^systemctl\\s+list-timers|^systemctl\\s+status\\s+certbot.timer'], 'certbot.timer inactive (dead)\nLast run: 60 days ago', 'Вероятная причина: задача renewal не работала.', 'systemctl status certbot.timer'),
 step('Проверь тестовое обновление',['^(sudo\\s+)?certbot\\s+renew\\s+--dry-run'], 'Congratulations, all simulated renewals succeeded.', 'В бою сначала dry-run, затем согласованный выпуск и проверка цепочки.', 'sudo certbot renew --dry-run')
], 'Не устраняй проблему через curl -k. Восстанови автоматизацию обновления и проверь текущий сертификат.', 'lock'),
S('db-port','Приложение не видит PostgreSQL',3,'TCP / База данных','В логах connect timeout к 10.20.30.15:5432.', ['Connection timed out to database','Сам сервер DB работает'], 'ACL блокирует путь TCP/5432 между подсетями', [
 step('Проверь маршрут до базы',['^ip\\s+route\\s+get\\s+10\\.20\\.30\\.15'], '10.20.30.15 via 10.20.10.1 dev ens3 src 10.20.10.25', 'Есть маршрут к next-hop.', 'ip route get 10.20.30.15'),
 step('Проверь TCP-порт',['^nc\\s+-vz\\s+10\\.20\\.30\\.15\\s+5432'], 'nc: connect to 10.20.30.15 port 5432 (tcp) timed out', 'Timeout — не то же самое, что refused.', 'nc -vz 10.20.30.15 5432'),
 step('Посмотри серверный слушатель (через консоль DB)',['^(sudo\\s+)?ss\\s+.*l.*t.*p'], 'LISTEN 0 244 0.0.0.0:5432 users:(("postgres",pid=1682))', 'На DB есть слушатель; проверяем фильтрацию между узлами.', 'sudo ss -lntp'),
 step('Посмотри правила firewall на DB',['^(sudo\\s+)?(ufw\\s+status|nft\\s+list\\s+ruleset)'], 'ALLOW TCP/5432 from 10.20.40.0/24\nDENY  TCP/5432 from others', 'Подсеть приложения 10.20.10.0/24 отсутствует в ACL.', 'sudo ufw status verbose')
], 'Изменение firewall должно проходить через согласование. Порт и IP-источник фиксируй в заявке.', 'network'),
S('nginx-bind','Nginx не может занять порт 80',3,'Сервисы / Порты','После обновления nginx не стартует, конфиг валиден.', ['bind() to 0.0.0.0:80 failed (98: Address already in use)'], 'Порт 80 уже занят apache2', [
 step('Проверь status nginx',['^systemctl\\s+status\\s+nginx'], 'nginx.service: failed\n(98: Address already in use) while binding to 0.0.0.0:80', 'Симптом указывает на конфликт слушателя.', 'systemctl status nginx'),
 step('Проверь синтаксис конфигурации',['^(sudo\\s+)?nginx\\s+-t'], 'nginx: configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful', 'Синтаксис в порядке, ищи другой сервис на порту.', 'sudo nginx -t'),
 step('Найди процесс на порту 80',['^(sudo\\s+)?ss\\s+.*l.*t.*p|^(sudo\\s+)?lsof\\s+-i\\s*:80'], 'LISTEN 0 511 0.0.0.0:80 users:(("apache2",pid=1562))', 'Порт занят apache2.', 'sudo ss -lntp'),
 step('Проверь состояние apache2',['^systemctl\\s+status\\s+apache2'], 'apache2.service: active (running)\nEnabled: enabled', 'Нужно установить, какой веб-сервер должен обслуживать порт, и затем согласовать изменение.', 'systemctl status apache2')
], 'Не отключай apache2 на проде только из-за конфликта: узнай, какой сервис нужен.', 'server'),
S('service-reboot','После перезагрузки сервис пропал',1,'systemd','После планового ребута мониторинг показывает nginx down.', ['Служба не запущена','До ребута работала'], 'Служба была active, но не enabled', [
 step('Проверь статус nginx',['^systemctl\\s+status\\s+nginx'], '● nginx.service\n Active: inactive (dead)\n Loaded: loaded (/lib/systemd/system/nginx.service; disabled)', 'Сервис не стартовал после загрузки.', 'systemctl status nginx'),
 step('Проверь автозапуск',['^systemctl\\s+is-enabled\\s+nginx'], 'disabled', 'Причина подтверждена.', 'systemctl is-enabled nginx'),
 step('Включи автозапуск',['^sudo\\s+systemctl\\s+enable\\s+nginx'], 'Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service', 'enable не запускает службу прямо сейчас.', 'sudo systemctl enable nginx'),
 step('Запусти службу сейчас',['^sudo\\s+systemctl\\s+start\\s+nginx'], '● nginx.service Active: active (running)', 'Сервис работает сейчас и будет запускаться после ребута.', 'sudo systemctl start nginx')
], 'Различай is-active и is-enabled: состояние сейчас ≠ автозапуск.', 'server')
];

const handbook = [
['Навигация','pwd','Текущий каталог'],['Навигация','ls -lah','Содержимое и скрытые файлы'],['Навигация','cd /path','Перейти в каталог'],['Навигация','mkdir -p /path','Создать дерево каталогов'],['Навигация','cp -a src dst','Копировать с атрибутами'],['Навигация','mv src dst','Переместить или переименовать'],['Навигация','stat file','Метаданные файла'],['Навигация','find /var -type f -name "*.log"','Искать файлы'],
['Логи','tail -n 50 file','Последние строки'],['Логи','tail -f file','Следить за файлом'],['Логи','less file','Листать файл'],['Логи','grep -i error file','Поиск без регистра'],['Логи','grep -R pattern /etc','Рекурсивный поиск'],['Логи','journalctl -u nginx -n 50','Логи службы'],['Логи','journalctl -u nginx -f','Журнал live'],['Логи','journalctl -b -p err','Ошибки с загрузки'],
['systemd','systemctl status nginx','Статус службы'],['systemd','systemctl --failed','Упавшие юниты'],['systemd','systemctl is-enabled nginx','Автозапуск'],['systemd','sudo systemctl restart nginx','Перезапуск'],['systemd','sudo systemctl reload nginx','Перечитать конфиг'],['systemd','sudo systemctl daemon-reload','Перечитать unit-файлы'],['systemd','systemctl cat nginx','Показать unit'],['systemd','systemctl list-timers --all','Таймеры'],
['Сеть','ip -br addr','Адреса интерфейсов'],['Сеть','ip route','Маршрутизация'],['Сеть','ip route get 1.1.1.1','Реальный маршрут'],['Сеть','ip -s link','Ошибки интерфейса'],['Сеть','ip neigh','ARP/ND-соседи'],['Сеть','ss -lntp','TCP LISTEN + PID'],['Сеть','ss -nt','TCP-соединения'],['Сеть','ss -s','Сводка сокетов'],['Сеть','nc -vz host 443','Проверка TCP'],['Сеть','dig example.com','DNS-запрос'],['Сеть','dig @1.1.1.1 example.com','DNS через конкретный сервер'],['Сеть','resolvectl status','Состояние резолвера'],['Сеть','curl -I https://example.com','HTTP-заголовки'],['Сеть','curl -v https://example.com','Подробный HTTP/TLS'],
['Система','ps aux','Список процессов'],['Система','ps aux --sort=-%cpu','CPU по процессам'],['Система','pgrep -a nginx','PID процесса'],['Система','free -h','Память'],['Система','uptime','Load average'],['Система','vmstat 1 5','CPU, swap, I/O'],['Система','df -h','Место на диске'],['Система','df -i','Inodes'],['Система','du -sh /var/log','Размер каталога'],['Система','lsblk -f','Диски и ФС'],['Система','sudo lsof +L1','Открытые удалённые файлы'],['Система','journalctl -k -b','Журнал ядра'],
['Доступ','whoami','Текущий пользователь'],['Доступ','id','UID и группы'],['Доступ','ls -ld /srv/app','Права каталога'],['Доступ','namei -l /srv/app/file','Права по всему пути'],['Доступ','chmod u+x script.sh','Добавить исполнение'],['Доступ','sudo chown user:group file','Изменить владельца'],['Доступ','ssh -vvv user@host','Отладка SSH'],['Доступ','sudo sshd -t','Проверить sshd'],['Доступ','sudo ufw status verbose','Проверить UFW'],['Доступ','sudo nft list ruleset','Проверить nftables'],
['Приложения','sudo nginx -t','Проверить Nginx'],['Приложения','sudo nginx -T','Вся конфигурация Nginx'],['Приложения','docker ps -a','Все контейнеры'],['Приложения','docker logs --tail 100 api','Логи контейнера'],['Приложения','docker inspect api','Состояние контейнера'],['Приложения','docker exec -it api sh','Shell в контейнере'],['Приложения','apt policy nginx','Версии пакета'],['Приложения','sudo apt update','Обновить индекс пакетов'],
['Shell','echo $?','Код последней команды'],['Shell','crontab -l','Список cron'],['Shell','bash -n script.sh','Проверка синтаксиса'],['Shell','date >> times.log','Добавить вывод в файл'],['Shell','cmd 2> errors.log','Записать stderr']
];
window.LINUXLAB = {modules, incidents, handbook, drills:modules.flatMap(m=>m.drills)};
})();
