---
title: "POP - 110 / 995"
description: "POP (Post Office Protocol) Enumeration for Pentesting"
weight: 110
---
# POP

{{<hint info>}}
Post Office Protocol.

**Default Ports**
- POP3: 110
- POP3S (POP3 over TLS or SSL): 995
{{</hint>}}

POP,
or POP3 (POP version 3),
is an application-layer protocol
used by email clients
to retrieve messages from a mail server.
It provides access via IP to mailboxes
maintained on a server.

Because POP was designed for temporary Internet connection,
clients connect,
retrieve messages,
store them on the client,
and finally delete them from the server.
Clients also have the option
to leave messages on the server.
By contrast,
[IMAP]({{< ref "imap" >}}) was designed to normally leave all messages
on the server
allowing multiple client applications
as online and offline modes.
[^pop3-wiki]

## Banner Grabbing

#### Telnet
```sh
telnet {{< param "m.RHOST" >}} 110
```

#### Netcat
```sh
nc -n {{< param "m.RHOST" >}} 110
```

#### openssl [^openssl]
```sh
openssl s_client -crlf -connect {{< param "m.RHOST" >}}:995
```
{{<details "Parameters">}}
- `s_client`:  SSL/TLS client program.
- `-crlf`:  translate a line feed from the terminal into `CR+LF`.
{{</details>}}

## NTLM Information Disclosure

See [SMTP NTLM Information Disclosure]({{< ref "smtp#ntlm-information-disclosure" >}})

#### [pop3-ntlm-info](https://nmap.org/nsedoc/scripts/pop3-ntlm-info.html) NSE Script

```sh
nmap -p 110,995 --script pop3-ntlm-info {{< param "m.RHOST" >}}
```

## Capabilities

POP3 capabilities are defined in [RFC2449](https://tools.ietf.org/html/rfc2449#section-6). The `CAPA` command allows a client to ask a server what commands it supports and possibly any site-specific policy.

#### [pop3-capabilities](https://nmap.org/nsedoc/scripts/pop3-capabilities.html) NSE Script

```sh
nmap -p 110,995 --script pop3-capabilities {{< param "m.RHOST" >}}
```

## Commands

```txt
USER    Username or mailbox.
PASS    Server/mailbox-specific password.
STAT    Number of messages in the mailbox.
LIST    [ message# ] Messages summary.
RETR    [ message# ] Retrieve selected message.
DELE    [ message# ] Delete selected message.
RSET    Reset the session. Undelete deleted messages.
NOOP    No-op. Keeps connection open.
QUIT    End session.
```

{{<hint info>}}
Server responses will start either with a successful (`+OK`) or failed status `-ERR`.
{{</hint>}}

## POP3 Exploits Search

Refer to [Exploits Search]({{< ref "exploits-search">}})

[^openssl]: OpenSSL Foundation, Inc. “/Docs/Manmaster/Man1/Openssl.Html.” OpenSSL.Org, https://www.openssl.org/docs/manmaster/man1/openssl.html.
[^pop3-wiki]: Contributors to Wikimedia projects. “Post Office Protocol - Wikipedia.” Wikipedia, the Free Encyclopedia, Wikimedia Foundation, Inc., 9 Sept. 2001, https://en.wikipedia.org/wiki/Post_Office_Protocol.
