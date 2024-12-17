;; Market Creation and Management Contract

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))

(define-data-var market-nonce uint u0)

(define-map markets
  { market-id: uint }
  {
    creator: principal,
    description: (string-utf8 500),
    options: (list 10 (string-utf8 100)),
    resolution-time: uint,
    oracle: principal,
    status: (string-ascii 20)
  }
)

(define-public (create-market (description (string-utf8 500)) (options (list 10 (string-utf8 100))) (resolution-time uint) (oracle principal))
  (let
    (
      (market-id (+ (var-get market-nonce) u1))
    )
    (asserts! (< (len options) u11) (err u103))
    (asserts! (> resolution-time block-height) (err u104))
    (map-set markets
      { market-id: market-id }
      {
        creator: tx-sender,
        description: description,
        options: options,
        resolution-time: resolution-time,
        oracle: oracle,
        status: "active"
      }
    )
    (var-set market-nonce market-id)
    (ok market-id)
  )
)

(define-read-only (get-market (market-id uint))
  (ok (unwrap! (map-get? markets { market-id: market-id }) (err u404)))
)

(define-public (update-market-status (market-id uint) (new-status (string-ascii 20)))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) (err u404)))
    )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set markets
      { market-id: market-id }
      (merge market { status: new-status })
    ))
  )
)

