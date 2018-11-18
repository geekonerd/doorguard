# doorguard
*a simple domestic doors or windows security system*

### Intro
**doorguard** è un insieme di componenti che consentono di verificare lo stato di apertura o chiusura di porte o finestre in casa tramite l'ausilio di un sensore Hall collegato ad un raspberry pi ed un magnete di controllo. Il sistema memorizza gli eventi nel tempo su un database mongodb, quindi sa estrapolarli per mostrarli all'utente tramite una web_app realtime costruita su node.js + socket.io (lato server) e jquery + bootstrap per la logica di presentazione su browser. In più tramite l'utilizzo di un ServiceWorker la web_app invia notifiche real time al client connesso. Per maggiori dettagli sul funzionamento generale rimando al *tutorial* pubblicato sul mio blog (https://geekonerd.blogspot.com/2018/11/tutorial-come-accertarsi-che-porte-e-finestre-siano-aperte-o-chiuse-via-raspberry-pi-e-notifiche-push.html).

#### Contenuto
Sono compresi:
- la web-app HTML+JS per la visualizzazione dei dati rilevati e invio notifiche
- il codice python per effettuare le rilevazioni
- il codice javascript per tirare su il server node.js che gestisce tutta l'architettura (dall'inserimento dei dati su mongodb alla sua estrapolazione e invio ai client connessi ad esso real-time tramite socket.io)

###### Nota bene
Il codice presente in questo repository funziona su un Raspberry Pi configurato come descritto nel tutorial. Nella versione attuale, si tratta di una *demo* che può essere utilizzata senza problemi in locale, ma ne è sconsigliato l'uso *as is* se esposta su Internet.
