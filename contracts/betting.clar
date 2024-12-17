;; Betting and Resolution Contract

(define-constant err-invalid-bet (err u200))
(define-constant err-market-closed (err u201))
(define-constant err-insufficient-balance (err u202))

(define-data-var market-id-nonce uint u0)

(define-map markets
  { market-id: uint }
  {
    creator: principal,
    description: (string-utf8 500),
    options: (list 10 (string-utf8 100)),
    resolution-time: uint,
    status: (string-ascii 20)
  }
)

(define-map bets
  { market-id: uint, better: principal }
  { option-index: uint, amount: uint }
)

(define-map market-pool
  { market-id: uint }
  { total-amount: uint }
)

(define-public (create-market (description (string-utf8 500)) (options (list 10 (string-utf8 100))) (resolution-time uint))
  (let
    (
      (market-id (+ (var-get market-id-nonce) u1))
    )
    (var-set market-id-nonce market-id)
    (map-set markets
      { market-id: market-id }
      {
        creator: tx-sender,
        description: description,
        options: options,
        resolution-time: resolution-time,
        status: "active"
      }
    )
    (ok market-id)
  )
)

(define-public (place-bet (market-id uint) (option-index uint) (amount uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) (err u404)))
    )
    (asserts! (is-eq (get status market) "active") err-market-closed)
    (asserts! (< option-index (len (get options market))) err-invalid-bet)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set bets
      { market-id: market-id, better: tx-sender }
      { option-index: option-index, amount: amount }
    )
    (map-set market-pool
      { market-id: market-id }
      { total-amount: (+ (default-to u0 (get total-amount (map-get? market-pool { market-id: market-id }))) amount) }
    )
    (ok true)
  )
)

(define-public (resolve-market (market-id uint) (winning-option uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) (err u404)))
    )
    (asserts! (is-eq tx-sender (get creator market)) (err u403))
    (asserts! (< winning-option (len (get options market))) err-invalid-bet)
    (map-set markets
      { market-id: market-id }
      (merge market { status: "resolved" })
    )
    (ok true)
  )
)

(define-read-only (get-market (market-id uint))
  (ok (unwrap! (map-get? markets { market-id: market-id }) (err u404)))
)

(define-read-only (get-bet (market-id uint) (better principal))
  (ok (unwrap! (map-get? bets { market-id: market-id, better: better }) (err u404)))
)

