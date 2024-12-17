;; Automated Market Maker (AMM) Contract

(define-constant err-invalid-market (err u300))
(define-constant err-insufficient-liquidity (err u301))

(define-map liquidity-pools
  { market-id: uint }
  { total-liquidity: uint, shares: (list 10 uint) }
)

(define-public (provide-liquidity (market-id uint) (amounts (list 10 uint)))
  (let
    (
      (market (unwrap! (contract-call? .market-creation get-market market-id) (err u404)))
      (pool (default-to { total-liquidity: u0, shares: (list ) } (map-get? liquidity-pools { market-id: market-id })))
      (total-provided (fold + amounts u0))
    )
    (asserts! (is-eq (len amounts) (len (get options market))) err-invalid-market)
    (try! (stx-transfer? total-provided tx-sender (as-contract tx-sender)))
    (map-set liquidity-pools
      { market-id: market-id }
      {
        total-liquidity: (+ (get total-liquidity pool) total-provided),
        shares: (map + amounts (get shares pool))
      }
    )
    (ok true)
  )
)

(define-read-only (get-liquidity-pool (market-id uint))
  (ok (unwrap! (map-get? liquidity-pools { market-id: market-id }) (err u404)))
)

(define-public (swap (market-id uint) (input-index uint) (output-index uint) (input-amount uint))
  (let
    (
      (pool (unwrap! (map-get? liquidity-pools { market-id: market-id }) (err u404)))
      (shares (get shares pool))
      (input-reserve (unwrap! (element-at shares input-index) err-invalid-market))
      (output-reserve (unwrap! (element-at shares output-index) err-invalid-market))
      (output-amount (/ (* input-amount output-reserve) (+ input-reserve input-amount)))
    )
    (asserts! (> output-amount u0) err-insufficient-liquidity)
    (try! (stx-transfer? input-amount tx-sender (as-contract tx-sender)))
    (try! (as-contract (stx-transfer? output-amount tx-sender tx-sender)))
    (ok output-amount)
  )
)

