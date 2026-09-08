# Bilan de validation — 8 septembre 2026

## Résultats vérifiés

| Vérification | Résultat |
| --- | --- |
| Tests backend Laravel | 46 tests réussis, 176 assertions |
| Contrôle de code frontend | `npm run lint` réussi |
| Compilation de production | `npm run build` réussi |
| Tests navigateur Edge/Chromium | 20 scénarios réussis |
| Formats testés | 320 × 740, 390 × 844, 768 × 1024 et 1440 × 900 |
| Audits des dépendances | Aucun avis de vulnérabilité signalé après mises à jour npm et Composer |
| Chargement PHP PSR-4 | `composer dump-autoload --optimize --strict-psr --no-scripts` réussi |
| Migration supplémentaire | Colonne `users.remember_token` ajoutée sans suppression de données |

Les tests navigateur utilisent une API simulée avec 26 produits pour reproduire les parcours de façon déterministe, sans modifier les comptes ou les commandes réels. Les tests Laravel utilisent une base SQLite en mémoire. Ils ne constituent ni un test de charge, ni une certification de tous les navigateurs, ni un paiement bancaire réel.

## Correctifs apportés

- Pagination : accès direct à une page, rechargement, changement de page, recherche et quantité par page ; suppression du retour involontaire à la première page.
- Catalogue : annulation des requêtes dépassées, délai maximal et bouton de reprise après erreur ; une fiche indisponible ne reste plus indéfiniment en chargement.
- Responsive : correction du débordement du menu arabe à 768 pixels, menu compact sur tablette et noms de clients longs contenus ; contrôle du clic extérieur.
- Paiement : vérification de la signature et du lien entre montant, devise, marchand et commande ; protection contre les callbacks répétés et la dégradation d'un paiement confirmé. Le navigateur consulte l'état serveur au lieu de croire l'URL « success ».
- Authentification : CSRF actif sur les écritures SPA, initialisation partagée du jeton, liens de récupération vers le frontend, rejet des jetons invalides et protection contre la réutilisation.
- Commandes : verrouillage des annulations et transitions de livraison ; une commande annulée ne peut plus être réactivée via l'affectation d'un livreur ou son changement de statut.
- Hébergement : correction des namespaces sensibles à la casse sur Linux, compatibilité de chargement de configuration avec PHP 8.2, options accessibles après mise en cache, scripts de démonstration bloqués en production.
- Conversion : FAQ FR/EN/AR, fidélité selon les règles existantes, accès mobile aux listes de promotions/favoris, métadonnées et données structurées des produits simples, vraie page 404.
- Statistiques : les URLs sensibles et paramètres de requête ne sont plus envoyés par le tracker frontend.

## Performance mesurée sur la compilation

Le fichier JavaScript principal passe d'environ 136 Ko à 116 Ko compressés gzip après séparation des pages. Les cartes, le checkout et les commandes se chargent à la demande. Cela représente une réduction du fichier initial, pas une promesse chiffrée de vitesse réelle : l'hébergement, les photos, le réseau et les réponses API doivent encore être mesurés en production.

## Conditions avant ouverture réelle

Le contrôle `php artisan shop:check-deployment` a détecté une configuration locale, avec debug actif, URLs non HTTPS, cookies non configurés pour la production, CMI absent/en mode test et des mots de passe de démonstration encore connus. Le transport e-mail est configuré mais la réception réelle n'a pas été vérifiée.

Il faut encore configurer le domaine/hébergeur, le compte marchand, les secrets côté serveur, les comptes réels et la sauvegarde/restauration ; effectuer une recette sur le vrai domaine et fournir les informations commerciales, conditions de vente/retours et confidentialité. Le filtrage Maroc doit être assuré par un proxy de confiance avec origine protégée : les en-têtes pays seuls ne suffisent pas.

Les photos de preuve de livraison sont actuellement stockées dans le disque public : leur confidentialité et leur migration vers un accès privé doivent être traitées avant une utilisation contenant des données personnelles. Le statut de remboursement administratif ne réalise pas le remboursement bancaire ; le parcours de nouvelle tentative de paiement et les remboursements doivent être validés avec le prestataire réel.

Les métadonnées React sont générées en JavaScript ; un prérendu/rendu serveur reste nécessaire pour garantir les aperçus des robots sociaux qui n'exécutent pas JavaScript. Aucune publicité payante, publication marketing, activation de paiement ou mise en production n'a été réalisée.

Ce bilan est une validation des parcours testés et des corrections décrites. Il ne certifie pas un site « 100 % prêt » sans la recette de production et les points restants ci-dessus.

Consulter aussi [le plan de lancement marketing](LANCEMENT_MARKETING.md) et `e-commerce-ali-backend/docs/MISE_EN_LIGNE.md`.

## Rejouer les contrôles

Frontend : `npm ci`, `npm run lint`, `npm run build`, puis `npm run test:browser` (Microsoft Edge installé, port 4173 libre). La configuration du navigateur peut être adaptée à Chromium sur un autre système.

Backend : `composer install`, `php artisan test`. Sur le serveur cible, après configuration et migration : `php artisan shop:check-deployment`.
